import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Logo from "../../components/Logo";
import LegalDocumentWebView from "../../components/LegalDocumentWebView";
import { useRouter } from "expo-router";
import { useTranslation } from "../../hooks/useTranslation";

const EULA_URL = "https://beetron.github.io/BTC2-mobile/eula.html";

// Read-only viewer, reached from the signup screen's EULA disclaimer link --
// there's no accept/scroll-gate here anymore since signing up itself is the
// agreement (see auth.signup.eulaPrefix/eulaLink/eulaSuffix).
const Eula = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-btc500">
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#D4F1F4" />
        </TouchableOpacity>
        <Logo size={44} />
        <Text className="flex-1 text-xl font-funnel-medium text-btc100 ml-2">
          {t("eula.welcomeTitle")}
        </Text>
      </View>

      <Text className="text-base font-funnel-regular text-btc200 px-4 pb-3">
        {t("eula.intro")}
      </Text>

      <View className="flex-1 mx-4 mb-4 rounded-xl overflow-hidden bg-btc400">
        <LegalDocumentWebView url={EULA_URL} />
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Eula;
