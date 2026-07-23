import { View, Text } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import SettingsPassword from "../../components/SettingsPassword";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsPasswordScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="m-6">
          <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
            {t("settings.password.title")}
          </Text>
          <SettingsPassword />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsPasswordScreen;
