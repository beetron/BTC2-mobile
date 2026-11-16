import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBackButton from "../../components/HeaderBackButton";
import LegalDocumentWebView from "../../components/LegalDocumentWebView";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";

const EULA_URL = "https://beetron.github.io/BTC2-mobile/eula.html";

// Read-only viewer, reached from the signup screen's EULA disclaimer link --
// there's no accept/scroll-gate here anymore since signing up itself is the
// agreement (see auth.signup.eulaPrefix/eulaLink/eulaSuffix).
const Eula = () => {
  const { t } = useTranslation();
  const ts = useTypeScale();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center px-2 pt-1 pb-2 gap-1">
        <HeaderBackButton routerOption="back" />
        <Text className={`${ts.title} flex-1 text-ink`} numberOfLines={2} accessibilityRole="header">
          {t("eula.welcomeTitle")}
        </Text>
      </View>

      <Text className={`${ts.body} text-inkMuted px-5 pb-3`}>{t("eula.intro")}</Text>

      <View className="flex-1 mx-4 mb-4 rounded-[20px] overflow-hidden border border-border bg-surface">
        <LegalDocumentWebView url={EULA_URL} />
      </View>

    </SafeAreaView>
  );
};

export default Eula;
