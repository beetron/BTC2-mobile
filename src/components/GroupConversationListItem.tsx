import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { GroupConversationSummary } from "../hooks/useGetGroupConversations";
import { useTranslation } from "../hooks/useTranslation";

// Sibling to ConversationListItem.tsx rather than a merged/branching
// component -- groups have no avatar image (skipped for v1) and no lazy
// find-or-create step since the conversation already exists.
const GroupConversationListItem = ({
  group,
}: {
  group: GroupConversationSummary;
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleOnPress = () => {
    router.push(`/members/conversation?conversationId=${group.conversationId}`);
  };

  return (
    <TouchableOpacity onPress={handleOnPress}>
      <View className="bg-btc500 m-2">
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-row items-center w-3/4">
            <View className="mr-6 items-center justify-center bg-btc100 rounded-full" style={{ width: 50, height: 50 }}>
              <MaterialCommunityIcons name="account-group" size={28} color="#1f1f2e" />
            </View>
            <View className="flex-shrink">
              <Text className="text-btc100 text-xl font-funnel-semi-bold" numberOfLines={1}>
                {group.name || t("home.groupFallbackName")}
              </Text>
              <Text className="text-btc200 text-sm font-funnel-regular">
                {t("home.memberCount", { count: group.memberCount })}
              </Text>
            </View>
          </View>
          {group.unreadCount !== 0 && (
            <View className="flex-row items-start justify-center w-1/4">
              <MaterialCommunityIcons
                name="message-alert-outline"
                size={24}
                color="#75E6DA"
              />
              <Text className="text-btc100 text-xl font-funnel-semi-bold ml-2">
                + {group.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GroupConversationListItem;
