import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import StackHeader from "../../components/StackHeader";
import CustomInput from "../../components/CustomInput";
import Avatar from "../../components/Avatar";
import FriendSelectList from "../../components/FriendSelectList";
import CustomButton from "../../components/CustomButton";
import conversationStore from "../../zustand/conversationStore";
import { useAuth } from "../../context/AuthContext";
import useGetConversationDetail from "../../hooks/useGetConversationDetail";
import useUpdateGroupInfo from "../../hooks/useUpdateGroupInfo";
import useAddGroupMembers from "../../hooks/useAddGroupMembers";
import useRemoveGroupMember from "../../hooks/useRemoveGroupMember";
import { useTranslation } from "../../hooks/useTranslation";
import { useThemeColors } from "../../context/ThemeContext";
import { useTypeScale } from "../../hooks/useTypeScale";

const MAX_NAME_LENGTH = 60;

const GroupSettingsScreen = () => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const router = useRouter();
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { selectedConversation, setSelectedConversation, setMessages } =
    conversationStore();
  const { getConversationDetail } = useGetConversationDetail();
  const { updateGroupInfo, isLoading: isRenaming } = useUpdateGroupInfo();
  const { addGroupMembers, isLoading: isAdding } = useAddGroupMembers();
  const { removeGroupMember, isLoading: isRemoving } = useRemoveGroupMember();

  const [nameDraft, setNameDraft] = useState(selectedConversation?.name || "");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedNewMemberIds, setSelectedNewMemberIds] = useState<string[]>([]);

  const myUserId = authState?.user?._id;
  const members = selectedConversation?.members || [];
  const myRole = members.find((m) => m.userId === myUserId)?.role;
  const canManage = myRole === "owner";

  if (!selectedConversation || selectedConversation.type !== "group") {
    return null;
  }

  const conversationId = selectedConversation.conversationId;

  const refresh = async () => {
    await getConversationDetail(conversationId);
  };

  const handleRename = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === selectedConversation.name) return;
    const success = await updateGroupInfo(conversationId, trimmed);
    if (success) await refresh();
  };

  const handleAddMembers = async () => {
    if (selectedNewMemberIds.length === 0) return;
    const success = await addGroupMembers(conversationId, selectedNewMemberIds);
    if (success) {
      setSelectedNewMemberIds([]);
      setShowAddMembers(false);
      await refresh();
    }
  };

  const handleRemoveMember = (targetUserId: string, nickname: string | null) => {
    Alert.alert(
      t("group.removeMemberTitle"),
      t("group.removeMemberMessage", {
        name: nickname || t("group.removeMemberFallbackName"),
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            const success = await removeGroupMember(conversationId, targetUserId);
            if (success) await refresh();
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(t("group.leaveGroupTitle"), t("group.leaveGroupMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("group.leaveButton"),
        style: "destructive",
        onPress: async () => {
          if (!myUserId) return;
          const success = await removeGroupMember(conversationId, myUserId);
          if (success) {
            setMessages([]);
            setSelectedConversation(null);
            // Pops groupSettings *and* the conversation underneath it -- replace()
            // only swapped groupSettings out, stranding a dead conversation screen
            // for the group we just left in the back stack.
            router.dismissTo("/members");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("group.settingsTitle")} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-4 mb-6">
          <Avatar group size={56} />
          {canManage ? (
            <View className="flex-1 flex-row items-center gap-2">
              <CustomInput
                title=""
                containerStyles="flex-1"
                value={nameDraft}
                onChangeText={(text) => setNameDraft(text.slice(0, MAX_NAME_LENGTH))}
                onBlur={handleRename}
                placeholder={t("group.namePlaceholder")}
                editable={!isRenaming}
              />
              {isRenaming && <ActivityIndicator size="small" color={colors.primary} />}
            </View>
          ) : (
            <Text className={`${ts.title} text-ink flex-1`} numberOfLines={2}>
              {selectedConversation.name || t("conversation.groupFallbackTitle")}
            </Text>
          )}
        </View>

        <Text className={`${ts.sectionHeader} text-inkMuted mx-1 mb-2`}>
          {t("group.membersLabel", { count: members.length })}
        </Text>
        <View className="bg-surface border border-border rounded-[20px] overflow-hidden">
          {members.map((member, index) => (
            <View
              key={member.userId}
              className={`flex-row items-center w-full px-4 py-2.5 gap-3 ${
                index > 0 ? "border-t border-divider" : ""
              }`}
              style={{ minHeight: 56 }}
            >
              <Avatar uri={member.profileImageData} size={36} />
              <View className="flex-1 min-w-0 flex-row items-center gap-2">
                <Text className={`${ts.body} text-ink flex-shrink`} numberOfLines={1}>
                  {member.nickname || t("common.unknown")}
                </Text>
                {member.role === "owner" ? (
                  <View className="rounded-full px-2 py-0.5 bg-primarySoft">
                    <Text className={ts.caption} style={{ color: colors.primary }}>
                      {t("group.roleOwner")}
                    </Text>
                  </View>
                ) : null}
              </View>
              {canManage && member.userId !== myUserId && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.userId, member.nickname)}
                  disabled={isRemoving}
                  accessibilityRole="button"
                  accessibilityLabel={t("group.removeMemberA11y", {
                    name: member.nickname || t("common.unknown"),
                  })}
                  style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
                >
                  <MaterialCommunityIcons
                    name="account-remove-outline"
                    size={22}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View className="mt-6">
          {showAddMembers ? (
            <>
              <FriendSelectList
                selectedIds={selectedNewMemberIds}
                onChange={setSelectedNewMemberIds}
                excludeIds={members.map((m) => m.userId)}
                emptyMessage={t("group.allFriendsInGroup")}
              />
              <View className="flex-row mt-4 gap-2">
                <CustomButton
                  title={t("common.cancel")}
                  handlePress={() => {
                    setShowAddMembers(false);
                    setSelectedNewMemberIds([]);
                  }}
                  variant="soft"
                  containerStyles="flex-1"
                />
                <CustomButton
                  title={t("common.add")}
                  handlePress={handleAddMembers}
                  disabled={selectedNewMemberIds.length === 0}
                  isLoading={isAdding}
                  containerStyles="flex-1"
                />
              </View>
            </>
          ) : (
            <CustomButton
              title={t("group.addMembersButton")}
              handlePress={() => setShowAddMembers(true)}
              variant="soft"
            />
          )}
        </View>

        <View className="mt-8 mb-4">
          <CustomButton
            title={t("group.leaveGroupTitle")}
            handlePress={handleLeaveGroup}
            variant="dangerSoft"
            containerStyles="w-full"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupSettingsScreen;
