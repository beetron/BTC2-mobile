import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "@/src/constants/colors";
import useDeleteMessages from "@/src/hooks/useDeleteMessages";
import useReportUser from "@/src/hooks/useReportUser";
import useBlockUser from "@/src/hooks/useBlockUser";
import conversationStore from "@/src/zustand/conversationStore";
import { useRouter } from "expo-router";
import { useTranslation } from "@/src/hooks/useTranslation";
import ActionSheet from "./ActionSheet";

// Direct chats: Delete Messages / Report User / Block User (report/block
// need selectedConversation.partnerId, which is null for groups).
// Group chats: Delete Messages / Group Settings -- member management
// (add/remove/rename/leave) lives in the groupSettings screen instead of
// being duplicated in this menu.
const ConversationActionMenu = () => {
  const { deleteMessages } = useDeleteMessages();
  const { reportUser } = useReportUser();
  const { blockUser } = useBlockUser();
  const { t } = useTranslation();
  const {
    latestMessageId,
    selectedConversation,
    setLatestMessageId,
    setSelectedConversation,
    setMessages,
  } = conversationStore();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

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

  const handleReport = () => {
    if (!latestMessageId) {
      Alert.alert(
        t("conversation.actionMenu.noMessageSelectedTitle"),
        t("conversation.actionMenu.noMessageSelectedMessage")
      );
      return;
    }

    if (!selectedConversation?.partnerId) {
      Alert.alert(t("common.error"), t("conversation.actionMenu.unableToIdentifyReport"));
      return;
    }

    Alert.alert(
      t("conversation.actionMenu.reportUser"),
      t("conversation.actionMenu.reportReasonMessage"),
      [
        {
          text: t("conversation.actionMenu.reasonInappropriate"),
          onPress: () => showConfirmation(t("conversation.actionMenu.reasonInappropriate")),
        },
        {
          text: t("conversation.actionMenu.reasonHarassment"),
          onPress: () => showConfirmation(t("conversation.actionMenu.reasonHarassment")),
        },
        {
          text: t("conversation.actionMenu.reasonSpam"),
          onPress: () => showConfirmation(t("conversation.actionMenu.reasonSpam")),
        },
        {
          text: t("conversation.actionMenu.reasonOther"),
          onPress: () => showConfirmation(t("conversation.actionMenu.reasonOther")),
        },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  const showConfirmation = (reason: string) => {
    Alert.alert(
      t("conversation.actionMenu.confirmReportTitle"),
      t("conversation.actionMenu.confirmReportMessage", { reason }),
      [
        {
          text: t("conversation.actionMenu.reportButton"),
          style: "destructive",
          onPress: async () => {
            if (!selectedConversation?.partnerId) {
              Alert.alert(t("common.error"), t("conversation.actionMenu.unableToIdentifyReport"));
              return;
            }
            const success = await reportUser({
              reason,
              friendId: selectedConversation.partnerId,
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
    </View>
  );
};

export default ConversationActionMenu;
