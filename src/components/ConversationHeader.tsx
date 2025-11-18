import { View, Text } from "react-native";
import HeaderBackButton from "./HeaderBackButton";
// Replaced header icons with an overflow menu
import friendStore from "../zustand/friendStore";
import ConversationActionMenu from "./ConversationActionMenu";

const ConversationHeader = () => {
  const { selectedFriend } = friendStore();

  return (
    <View className="flex-1 max-h-28 border-b-hairline border-btc100 bg-[#1f1f2e]">
      <View className="flex-row absolute bottom-0 items-center w-full px-2">
        <View className="flex-row items-center flex-1 min-w-0">
          <HeaderBackButton routerOption="replaceHome" />
          {selectedFriend && (
            <Text
              className="text-2xl font-funnel-regular text-btc100 ml-2 flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedFriend.nickname}
            </Text>
          )}
        </View>
        <ConversationActionMenu />
      </View>
    </View>
  );
};

export default ConversationHeader;
