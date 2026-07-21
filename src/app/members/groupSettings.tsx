import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import FriendSelectList from "../../components/FriendSelectList";
import CustomButton from "../../components/CustomButton";
import conversationStore from "../../zustand/conversationStore";
import { useAuth } from "../../context/AuthContext";
import useGetConversationDetail from "../../hooks/useGetConversationDetail";
import useUpdateGroupInfo from "../../hooks/useUpdateGroupInfo";
import useAddGroupMembers from "../../hooks/useAddGroupMembers";
import useRemoveGroupMember from "../../hooks/useRemoveGroupMember";
import { useTranslation } from "../../hooks/useTranslation";

const MAX_NAME_LENGTH = 60;

const roleBadgeColor = (role: string) => {
  if (role === "owner") return "#b47cd6"; // grape
  return "#D4F1F4";
};

const GroupSettingsScreen = () => {
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
            router.replace("/members");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <ScrollView className="m-6">
        <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
          {t("group.settingsTitle")}
        </Text>

        {canManage ? (
          <View className="flex-row items-center mb-6">
            <TextInput
              value={nameDraft}
              onChangeText={(text) => setNameDraft(text.slice(0, MAX_NAME_LENGTH))}
              onBlur={handleRename}
              placeholder={t("group.namePlaceholder")}
              placeholderTextColor="#7a7a8c"
              editable={!isRenaming}
              className="text-btc100 font-funnel-regular text-xl border-b-hairline border-btc100 pb-2 flex-1"
            />
            {isRenaming && <ActivityIndicator size="small" color="#75E6DA" className="ml-2" />}
          </View>
        ) : (
          <Text className="text-btc100 font-funnel-semi-bold text-xl mb-6">
            {selectedConversation.name || t("conversation.groupFallbackTitle")}
          </Text>
        )}

        <Text className="text-btc200 font-funnel-regular text-lg mb-2">
          {t("group.membersLabel", { count: members.length })}
        </Text>
        {members.map((member) => (
          <View
            key={member.userId}
            className="flex-row items-center justify-between w-full py-2"
          >
            <View className="flex-row items-center flex-1 min-w-0">
              <Text
                className="text-btc100 font-funnel-regular text-xl flex-shrink"
                numberOfLines={1}
              >
                {member.nickname || t("common.unknown")}
              </Text>
              <Text
                className="font-funnel-regular text-sm ml-2"
                style={{ color: roleBadgeColor(member.role) }}
              >
                {member.role === "owner" ? t("group.roleOwner") : t("group.roleMember")}
              </Text>
            </View>
            {canManage && member.userId !== myUserId && (
              <TouchableOpacity
                onPress={() => handleRemoveMember(member.userId, member.nickname)}
                disabled={isRemoving}
              >
                <MaterialCommunityIcons name="account-remove" size={24} color="#e07a7a" />
              </TouchableOpacity>
            )}
          </View>
        ))}

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
                  containerStyles="flex-1 bg-btc400"
                  textStyles="text-xl"
                />
                <CustomButton
                  title={t("common.add")}
                  handlePress={handleAddMembers}
                  disabled={selectedNewMemberIds.length === 0}
                  isLoading={isAdding}
                  containerStyles="flex-1"
                  textStyles="text-xl"
                />
              </View>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setShowAddMembers(true)}
              className="flex-row items-center justify-center bg-btc400 rounded-xl py-3"
            >
              <MaterialCommunityIcons name="account-plus" size={22} color="#75E6DA" />
              <Text className="text-btc100 font-funnel-semi-bold text-lg ml-2">
                {t("group.addMembersButton")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mt-8 mb-4">
          <CustomButton
            title={t("group.leaveGroupTitle")}
            handlePress={handleLeaveGroup}
            containerStyles="w-full bg-red-700"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupSettingsScreen;
