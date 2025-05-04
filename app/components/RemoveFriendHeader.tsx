import { View } from "react-native";
import HeaderBackButton from "./HeaderBackButton";

const RemoveFriendHeader = () => {
  return (
    <View className="flex-1 max-h-28 justify-center border-b-hairline border-btc100 bg-[#1f1f2e]">
      <HeaderBackButton />
    </View>
  );
};

export default RemoveFriendHeader;
