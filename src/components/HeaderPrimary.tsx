import { Image, View, Text } from "react-native";
import { images } from "../constants/images";

const HeaderPrimary = () => {
  const logoImage = images.btc2LogoSmall;
  const appVersion = process.env.EXPO_PUBLIC_APP_VERSION;
  return (
    <View className="flex-1 max-h-28 border-b-hairline border-btc100 bg-[#1f1f2e] justify-end">
      <View className="flex-row justify-start items-end m-4">
        <Image
          source={logoImage}
          resizeMode="contain"
          style={{ width: 40, height: 40 }}
        />
        <Text className="font-funnel-medium text-3xl text-btc100 ml-4">
          bTC2
        </Text>
        <Text className="font-funnel-regular text-btc200 text-xl ml-2">
          (v.{appVersion})
        </Text>
      </View>
    </View>
  );
};

export default HeaderPrimary;
