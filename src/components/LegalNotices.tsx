import { View, TouchableOpacity, Text, Linking } from "react-native";

const LegalNotices = () => {
  const openPrivacyPolicy = () => {
    Linking.openURL("https://beetron.github.io/BTC2-mobile/#privacy-policy");
  };

  const openEULA = () => {
    Linking.openURL("https://beetron.github.io/BTC2-mobile/eula.html");
  };

  return (
    <View className="flex-row w-full">
      <TouchableOpacity
        className="flex-1 bg-btc400 p-4 mr-1 rounded-lg"
        onPress={openPrivacyPolicy}
      >
        <Text className="text-btc100 font-funnel-regular text-center text-lg">
          Privacy Policy
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 bg-btc400 p-4 ml-1 rounded-lg"
        onPress={openEULA}
      >
        <Text className="text-btc100 font-funnel-regular text-center text-lg">
          EULA
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LegalNotices;
