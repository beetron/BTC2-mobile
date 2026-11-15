import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import StackHeader from "../../components/StackHeader";
import SettingsEmail from "../../components/SettingsEmail";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsEmailScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("settings.email.title")} />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="mx-4 my-5">
          <SettingsEmail />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsEmailScreen;
