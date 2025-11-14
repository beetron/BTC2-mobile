import { View, Text } from "react-native";
import HeaderBackButton from "./HeaderBackButton";
import ConversationDeleteButton from "./ConversationDeleteButton";
import friendStore from "../zustand/friendStore";

const ConversationHeader = () => {
  const { selectedFriend } = friendStore();

  return (
    <View className="flex-1 max-h-28 border-b-hairline border-btc100 bg-[#1f1f2e]">
      <View className="flex-row absolute bottom-0 items-center w-full">
        <View className="flex-row items-center flex-1">
          <HeaderBackButton routerOption="replaceHome" />
          {selectedFriend && (
            <Text className="text-2xl font-funnel-regular text-btc100 ml-2 justify-center">
              {selectedFriend.nickname}
            </Text>
          )}
        </View>
        <ConversationDeleteButton />
      </View>
    </View>
  );
};

export default ConversationHeader;
