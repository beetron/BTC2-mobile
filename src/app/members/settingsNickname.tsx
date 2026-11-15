import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import StackHeader from "../../components/StackHeader";
import SettingsNickname from "../../components/SettingsNickname";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsNicknameScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("settings.nickname.label")} />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="mx-4 my-5">
          <SettingsNickname />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsNicknameScreen;
