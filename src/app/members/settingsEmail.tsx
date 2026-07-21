import { View, Text } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import SettingsEmail from "../../components/SettingsEmail";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsEmailScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="m-6">
          <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
            {t("settings.email.title")}
          </Text>
          <SettingsEmail />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsEmailScreen;
