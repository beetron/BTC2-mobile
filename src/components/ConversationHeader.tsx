import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import HeaderBackButton from "./HeaderBackButton";
// Replaced header icons with an overflow menu
import conversationStore from "../zustand/conversationStore";
import ConversationActionMenu from "./ConversationActionMenu";
import { useTranslation } from "../hooks/useTranslation";

const ConversationHeader = () => {
  const { selectedConversation } = conversationStore();
  const { t } = useTranslation();
  const router = useRouter();
  const isGroup = selectedConversation?.type === "group";
  const title =
    selectedConversation?.name ||
    (isGroup
      ? t("conversation.groupFallbackTitle")
      : t("conversation.chatFallbackTitle"));

  return (
    <View className="flex-1 max-h-28 border-b-hairline border-btc100 bg-[#1f1f2e]">
      <View className="flex-row absolute bottom-0 items-center w-full px-2">
        <View className="flex-row items-center flex-1 min-w-0">
          <HeaderBackButton routerOption="replaceHome" />
          {selectedConversation && isGroup && (
            <TouchableOpacity
              onPress={() => router.push("/members/groupSettings")}
              className="ml-2 flex-1 min-w-0"
            >
              <Text
                className="text-2xl font-funnel-regular text-btc100"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
              <Text className="text-sm font-funnel-regular text-btc200">
                {t("conversation.memberCountSubtitle", {
                  count: selectedConversation.members.length,
                })}
              </Text>
            </TouchableOpacity>
          )}
          {selectedConversation && !isGroup && (
            <View className="ml-2 flex-1 min-w-0">
              <Text
                className="text-2xl font-funnel-regular text-btc100"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
            </View>
          )}
        </View>
        <ConversationActionMenu />
      </View>
    </View>
  );
};

export default ConversationHeader;
