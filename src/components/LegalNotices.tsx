import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../constants/colors";

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
    <View>
      <TouchableOpacity onPress={openPrivacyPolicy}>
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-btc500">
          <Text className="text-btc100 font-funnel-regular text-lg">
            {t("settings.legal.privacyPolicy")}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.btc200}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={openEULA}>
        <View className="flex-row justify-between items-center px-4 py-3">
          <Text className="text-btc100 font-funnel-regular text-lg">
            {t("settings.legal.eula")}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.btc200}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LegalNotices;
