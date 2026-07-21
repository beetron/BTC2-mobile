import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";
import CustomButton from "../../components/CustomButton";
import LegalDocumentWebView from "../../components/LegalDocumentWebView";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "../../hooks/useTranslation";

const EULA_URL = "https://beetron.github.io/BTC2-mobile/eula.html";

const Eula = () => {
  const [bottomReached, setBottomReached] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleAgree = async () => {
    try {
      await SecureStore.setItemAsync("eulaAccepted", "true");
      router.replace("./Login");
    } catch (error) {
      Alert.alert(t("common.error"), t("eula.saveErrorMessage"));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-btc500">
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <Logo size={44} />
        <Text className="flex-1 text-xl font-funnel-medium text-btc100 ml-2">
          {t("eula.welcomeTitle")}
        </Text>
      </View>

      <Text className="text-base font-funnel-regular text-btc200 px-4 pb-3">
        {t("eula.intro")}
      </Text>

      <View className="flex-1 mx-4 rounded-xl overflow-hidden bg-btc400">
        <LegalDocumentWebView
          url={EULA_URL}
          onScrollStateChange={({ atBottom }) => setBottomReached(atBottom)}
        />
      </View>

      <View className="p-4">
        <Text className="text-sm font-funnel-regular text-btc300 text-center mb-3 leading-4">
          {bottomReached ? t("eula.agreeNotice") : t("eula.scrollHint")}
        </Text>

        <CustomButton
          title={t("eula.agreeButton")}
          isLoading={false}
          textStyles="font-funnel-regular"
          containerStyles="w-3/5 self-center"
          handlePress={handleAgree}
          disabled={!bottomReached}
        />
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Eula;
