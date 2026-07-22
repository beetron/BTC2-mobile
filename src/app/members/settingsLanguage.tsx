import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import { useLocale, Locale } from "../../context/LocaleContext";
import { useTranslation } from "../../hooks/useTranslation";

const OPTIONS: { locale: Locale; labelKey: string }[] = [
  { locale: "en", labelKey: "settings.language.english" },
  { locale: "ja", labelKey: "settings.language.japanese" },
];

const SettingsLanguageScreen = () => {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <View className="m-6">
        <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
          {t("settings.language.title")}
        </Text>
        {OPTIONS.map((option) => {
          const isSelected = option.locale === locale;
          return (
            <TouchableOpacity
              key={option.locale}
              onPress={() => setLocale(option.locale)}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-btc100 font-funnel-regular text-xl">
                {t(option.labelKey)}
              </Text>
              <MaterialCommunityIcons
                name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                size={26}
                color={isSelected ? "#75E6DA" : "#D4F1F4"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default SettingsLanguageScreen;
