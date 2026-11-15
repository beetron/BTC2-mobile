import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import StackHeader from "../../components/StackHeader";
import SettingsPassword from "../../components/SettingsPassword";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsPasswordScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("settings.password.title")} />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="mx-4 my-5">
          <SettingsPassword />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsPasswordScreen;
