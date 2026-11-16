import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import StackHeader from "../../components/StackHeader";
import SettingsUniqueId from "../../components/SettingsUniqueId";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsUniqueIdScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("settings.uniqueId.rowLabel")} />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="mx-4 my-5">
          <SettingsUniqueId />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsUniqueIdScreen;
