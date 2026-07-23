import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../constants/colors";

const SettingsNicknameRow = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <TouchableOpacity onPress={() => router.push("../settingsNickname")}>
      <View className="flex-row justify-between items-center px-4 py-3">
        <View className="flex-row items-center gap-3">
          <MaterialCommunityIcons name="account-outline" size={20} color={colors.accent} />
          <Text className="text-btc100 font-funnel-regular text-lg">
            {t("settings.nickname.label")}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.btc200}
        />
      </View>
    </TouchableOpacity>
  );
};

export default SettingsNicknameRow;
