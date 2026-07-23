import { Text, View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const SettingsUsername = () => {
  const { authState } = useAuth();
  const currentUsername = authState?.user?.username;
  const { t } = useTranslation();

  return (
    <View>
      <Text className="font-funnel-regular text-btc200 text-sm">
        {t("settings.username.label")}
      </Text>
      <Text className="text-btc100 font-funnel-regular text-xl mt-0.5">
        {currentUsername}
      </Text>
    </View>
  );
};

export default SettingsUsername;
