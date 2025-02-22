import { View, Text } from "react-native";

const HeaderPrimary = () => {
  return (
    <View className="flex-1 max-h-28 border-b-hairline border-btc100 bg-[#1f1f2e] justify-center">
      <Text className="text-2xl text-btc100 top-5 left-5 font-funnel-medium">
        Header
      </Text>
    </View>
  );
};

export default HeaderPrimary;
