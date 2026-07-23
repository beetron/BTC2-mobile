import { View, Text } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import SettingsUniqueId from "../../components/SettingsUniqueId";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsUniqueIdScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View className="m-6">
          <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
            {t("settings.uniqueId.rowLabel")}
          </Text>
          <SettingsUniqueId />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsUniqueIdScreen;
