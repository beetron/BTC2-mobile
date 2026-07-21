import { View, Text } from "react-native";
import HeaderBackButton from "./HeaderBackButton";
// Replaced header icons with an overflow menu
import conversationStore from "../zustand/conversationStore";
import ConversationActionMenu from "./ConversationActionMenu";
import { useTranslation } from "../hooks/useTranslation";

const ConversationHeader = () => {
  const { selectedConversation } = conversationStore();
  const { t } = useTranslation();
  const title =
    selectedConversation?.name ||
    (selectedConversation?.type === "group"
      ? t("conversation.groupFallbackTitle")
      : t("conversation.chatFallbackTitle"));

  return (
    <View className="flex-1 max-h-28 border-b-hairline border-btc100 bg-[#1f1f2e]">
      <View className="flex-row absolute bottom-0 items-center w-full px-2">
        <View className="flex-row items-center flex-1 min-w-0">
          <HeaderBackButton routerOption="replaceHome" />
          {selectedConversation && (
            <View className="ml-2 flex-1 min-w-0">
              <Text
                className="text-2xl font-funnel-regular text-btc100"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
              {selectedConversation.type === "group" && (
                <Text className="text-sm font-funnel-regular text-btc200">
                  {t("conversation.memberCountSubtitle", {
                    count: selectedConversation.members.length,
                  })}
                </Text>
              )}
            </View>
          )}
        </View>
        <ConversationActionMenu />
      </View>
    </View>
  );
};

export default ConversationHeader;
