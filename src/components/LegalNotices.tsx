import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "../hooks/useTranslation";

const LegalNotices = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const openPrivacyPolicy = () => {
    router.push({
      pathname: "../legalDocument",
      params: {
        url: "https://beetron.github.io/BTC2-mobile/#privacy-policy",
        titleKey: "settings.legal.privacyPolicy",
      },
    });
  };

  const openEULA = () => {
    router.push({
      pathname: "../legalDocument",
      params: {
        url: "https://beetron.github.io/BTC2-mobile/eula.html",
        titleKey: "settings.legal.eula",
      },
    });
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
