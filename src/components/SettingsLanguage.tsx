import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "../hooks/useTranslation";

const SettingsLanguage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View className="w-full bg-btc500 p-4">
      <TouchableOpacity onPress={() => router.push("../settingsLanguage")}>
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-btc100 font-funnel-regular text-2xl">
            {t("settings.languageRow")}
          </Text>
          <AntDesign name="arrow-right" size={28} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsLanguage;
