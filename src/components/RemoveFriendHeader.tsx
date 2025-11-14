import { View } from "react-native";
import HeaderBackButton from "./HeaderBackButton";

const RemoveFriendHeader = () => {
  return (
    <View className="flex-1 max-h-28 justify-center border-b-hairline border-btc100 bg-[#1f1f2e]">
      <View className="mt-14 ml-4">
        <HeaderBackButton routerOption="back" />
      </View>
    </View>
  );
};

export default RemoveFriendHeader;
