import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import StackHeader from "../../components/StackHeader";
import LegalDocumentWebView from "../../components/LegalDocumentWebView";
import { useTranslation } from "../../hooks/useTranslation";

const LegalDocumentScreen = () => {
  const { url, titleKey } = useLocalSearchParams<{
    url: string;
    titleKey: string;
  }>();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t(titleKey)} />
      <View className="flex-1 m-4 rounded-[20px] overflow-hidden border border-border bg-surface">
        <LegalDocumentWebView url={url} />
      </View>
    </View>
  );
};

export default LegalDocumentScreen;
