import { View, Text } from "react-native";

const HeaderPrimary = () => {
  const appVersion = process.env.EXPO_PUBLIC_APP_VERSION;
  console.log("App Version: ", appVersion);
  return (
    <View className="flex-1 max-h-28 border-b-hairline border-btc100 bg-[#1f1f2e] justify-end">
      <View className="flex-row justify-start m-4">
        <Text className="font-funnel-medium text-3xl text-btc100">bTC2</Text>
        <Text className="font-funnel-regular text-btc200 text-xl ml-2">
          (v.{appVersion})
        </Text>
      </View>
    </View>
  );
};

export default HeaderPrimary;
