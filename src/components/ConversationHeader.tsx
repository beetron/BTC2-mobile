import { View } from "react-native";
import HeaderBackButton from "./HeaderBackButton";
import ConversationDeleteButton from "./ConversationDeleteButton";

const ConversationHeader = () => {
  return (
    <View className="flex-1 max-h-28 justify-center border-b-hairline border-btc100 bg-[#1f1f2e]">
      <View className="flex-row absolute bottom-0">
        <HeaderBackButton routerOption="replaceHome" />
        <ConversationDeleteButton />
      </View>
    </View>
  );
};

export default ConversationHeader;
