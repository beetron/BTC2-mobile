import { View, TouchableOpacity, Text, Linking } from "react-native";
import { useTranslation } from "../hooks/useTranslation";

const LegalNotices = () => {
  const { t } = useTranslation();
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
          {t("settings.legal.privacyPolicy")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 bg-btc400 p-4 ml-1 rounded-lg"
        onPress={openEULA}
      >
        <Text className="text-btc100 font-funnel-regular text-center text-lg">
          {t("settings.legal.eula")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LegalNotices;
