import { View } from "react-native";
import HeaderBackButton from "./HeaderBackButton";

const ConversationHeader = () => {
  return (
    <View className="flex-1 max-h-28 justify-center border-b-hairline border-btc100 bg-[#1f1f2e]">
      <HeaderBackButton />
    </View>
  );
};

export default ConversationHeader;
