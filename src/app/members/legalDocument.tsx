import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import LegalDocumentWebView from "../../components/LegalDocumentWebView";
import { useTranslation } from "../../hooks/useTranslation";

const LegalDocumentScreen = () => {
  const { url, titleKey } = useLocalSearchParams<{
    url: string;
    titleKey: string;
  }>();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <Text className="text-btc100 font-funnel-semi-bold text-2xl mx-6 my-4">
        {t(titleKey)}
      </Text>
      <View className="flex-1 mx-4 mb-4 rounded-xl overflow-hidden bg-btc400">
        <LegalDocumentWebView url={url} />
      </View>
    </View>
  );
};

export default LegalDocumentScreen;
