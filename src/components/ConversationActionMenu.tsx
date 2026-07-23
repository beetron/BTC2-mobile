import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "@/src/constants/colors";
import useDeleteMessages from "@/src/hooks/useDeleteMessages";
import useReportUser from "@/src/hooks/useReportUser";
import useBlockUser from "@/src/hooks/useBlockUser";
import conversationStore from "@/src/zustand/conversationStore";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useTranslation } from "@/src/hooks/useTranslation";
import ActionSheet, { ActionSheetOption } from "./ActionSheet";

// Direct chats: Delete Messages / Report User / Block User, targeting
// selectedConversation.partnerId directly.
// Group chats: Delete Messages / Report User / Block User / Group Settings.
// Report opens a second sheet to pick which member to report (partnerId
// doesn't exist for groups). Block is disabled in groups -- there's no
// single "the other person" to block, and blocking one member wouldn't
// remove the rest, so we point people at leaving the group instead.
const ConversationActionMenu = () => {
  const { deleteMessages } = useDeleteMessages();
  const { reportUser } = useReportUser();
  const { blockUser } = useBlockUser();
  const { t } = useTranslation();
  const { authState } = useAuth();
  const myUserId = authState?.user?._id;
  const {
    latestMessageId,
    selectedConversation,
    setLatestMessageId,
    setSelectedConversation,
    setMessages,
  } = conversationStore();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [memberPickerVisible, setMemberPickerVisible] = useState(false);

  const handleDelete = () => {
    if (!latestMessageId) {
      Alert.alert(t("conversation.actionMenu.noMessagesToDelete"));
      return;
    }

    Alert.alert(
      t("conversation.actionMenu.deleteMessages"),
      t("conversation.actionMenu.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
          style: "destructive",
          onPress: async () => {
            const success = await deleteMessages(latestMessageId);
            if (success) {
              setLatestMessageId(null);
            }
          },
        },
      ]
    );
  };

  // targetUserId: the direct-chat partner by default, or (for groups) the
  // member picked from the member-select sheet below.
  const handleReport = (targetUserId?: string) => {
    if (!latestMessageId) {
      Alert.alert(
        t("conversation.actionMenu.noMessageSelectedTitle"),
        t("conversation.actionMenu.noMessageSelectedMessage")
      );
      return;
    }

    const reportTargetId = targetUserId ?? selectedConversation?.partnerId;
    if (!reportTargetId) {
      Alert.alert(t("common.error"), t("conversation.actionMenu.unableToIdentifyReport"));
      return;
    }

    Alert.alert(
      t("conversation.actionMenu.reportUser"),
      t("conversation.actionMenu.reportReasonMessage"),
      [
        {
          text: t("conversation.actionMenu.reasonInappropriate"),
          onPress: () =>
            showConfirmation(t("conversation.actionMenu.reasonInappropriate"), reportTargetId),
        },
        {
          text: t("conversation.actionMenu.reasonHarassment"),
          onPress: () =>
            showConfirmation(t("conversation.actionMenu.reasonHarassment"), reportTargetId),
        },
        {
          text: t("conversation.actionMenu.reasonSpam"),
          onPress: () =>
            showConfirmation(t("conversation.actionMenu.reasonSpam"), reportTargetId),
        },
        {
          text: t("conversation.actionMenu.reasonOther"),
          onPress: () =>
            showConfirmation(t("conversation.actionMenu.reasonOther"), reportTargetId),
        },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  const showConfirmation = (reason: string, targetUserId: string) => {
    Alert.alert(
      t("conversation.actionMenu.confirmReportTitle"),
      t("conversation.actionMenu.confirmReportMessage", { reason }),
      [
        {
          text: t("conversation.actionMenu.reportButton"),
          style: "destructive",
          onPress: async () => {
            const success = await reportUser({
              reason,
              friendId: targetUserId,
            });
            if (success) {
              Alert.alert(
                t("conversation.actionMenu.reportSubmittedTitle"),
                t("conversation.actionMenu.reportSubmittedMessage")
              );
            }
          },
        },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  // Group chats: opens a member-picker sheet since there's no single
  // partnerId to report -- picking a member re-enters the same
  // reason-selection flow used for direct chats.
  const openGroupReportPicker = () => {
    if (!latestMessageId) {
      Alert.alert(
        t("conversation.actionMenu.noMessageSelectedTitle"),
        t("conversation.actionMenu.noMessageSelectedMessage")
      );
      return;
    }

    const reportableMembers = (selectedConversation?.members ?? []).filter(
      (member) => member.userId !== myUserId
    );

    if (reportableMembers.length === 0) {
      Alert.alert(t("common.error"), t("conversation.actionMenu.noMembersToReport"));
      return;
    }

    setMemberPickerVisible(true);
  };

  const memberPickerOptions: ActionSheetOption[] = (selectedConversation?.members ?? [])
    .filter((member) => member.userId !== myUserId)
    .map((member) => ({
      label: member.nickname || t("common.unknown"),
      icon: "account-circle-outline",
      onPress: () => handleReport(member.userId),
    }));

  // Group chats have no single "the other person" to block, and blocking
  // one member wouldn't remove the rest from the conversation -- leaving
  // is the group equivalent of blocking in a direct chat.
  const handleGroupBlockAttempt = () => {
    Alert.alert(
      t("conversation.actionMenu.blockUser"),
      t("conversation.actionMenu.blockUnavailableInGroupMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("conversation.actionMenu.groupSettings"),
          onPress: () => router.push("/members/groupSettings"),
        },
      ]
    );
  };

  const handleBlock = () => {
    if (!selectedConversation?.partnerId) {
      Alert.alert(t("common.error"), t("conversation.actionMenu.unableToIdentifyBlock"));
      return;
    }

    Alert.alert(
      t("conversation.actionMenu.blockConfirmTitle"),
      t("conversation.actionMenu.blockConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.block"),
          style: "destructive",
          onPress: async () => {
            const success = await blockUser(selectedConversation.partnerId!);
            if (success) {
              // Clear conversation state and go back to friends list
              setMessages([]);
              setSelectedConversation(null);
              // Replace current route with members index to show the conversation list
              router.replace("/members");
            }
          },
        },
      ]
    );
  };

  const menuOptions =
    selectedConversation?.type === "group"
      ? [
          {
            label: t("conversation.actionMenu.deleteMessages"),
            icon: "trash-can-outline",
            variant: "danger" as const,
            onPress: handleDelete,
          },
          {
            label: t("conversation.actionMenu.reportUser"),
            icon: "flag-outline",
            onPress: openGroupReportPicker,
          },
          {
            label: t("conversation.actionMenu.blockUser"),
            icon: "account-cancel-outline",
            variant: "danger" as const,
            onPress: handleGroupBlockAttempt,
          },
          {
            label: t("conversation.actionMenu.groupSettings"),
            icon: "account-group",
            onPress: () => router.push("/members/groupSettings"),
          },
        ]
      : [
          {
            label: t("conversation.actionMenu.deleteMessages"),
            icon: "trash-can-outline",
            variant: "danger" as const,
            onPress: handleDelete,
          },
          {
            label: t("conversation.actionMenu.reportUser"),
            icon: "flag-outline",
            onPress: handleReport,
          },
          {
            label: t("conversation.actionMenu.blockUser"),
            icon: "account-cancel-outline",
            variant: "danger" as const,
            onPress: handleBlock,
          },
        ];

  return (
    <View>
      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <MaterialCommunityIcons name="cog-outline" size={32} color={colors.btc100} />
      </TouchableOpacity>
      <ActionSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        options={menuOptions}
      />
      <ActionSheet
        visible={memberPickerVisible}
        onClose={() => setMemberPickerVisible(false)}
        options={memberPickerOptions}
        title={t("conversation.actionMenu.selectMemberToReport")}
      />
    </View>
  );
};

export default ConversationActionMenu;
