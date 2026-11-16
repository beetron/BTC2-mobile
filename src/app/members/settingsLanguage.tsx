import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import StackHeader from "../../components/StackHeader";
import { useLocale, Locale } from "../../context/LocaleContext";
import { useThemeColors } from "../../context/ThemeContext";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";

const OPTIONS: { locale: Locale; labelKey: string }[] = [
  { locale: "en", labelKey: "settings.language.english" },
  { locale: "ja", labelKey: "settings.language.japanese" },
];

const SettingsLanguageScreen = () => {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("settings.language.title")} />
      <View className="mx-4 my-5 bg-surface border border-border rounded-[20px] overflow-hidden">
        {OPTIONS.map((option, index) => {
          const isSelected = option.locale === locale;
          return (
            <TouchableOpacity
              key={option.locale}
              onPress={() => setLocale(option.locale)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              className={`flex-row items-center justify-between px-4 py-3 gap-3 ${
                index > 0 ? "border-t border-divider" : ""
              }`}
              style={{ minHeight: 54 }}
            >
              <Text className={`${ts.body} text-ink flex-1`}>{t(option.labelKey)}</Text>
              <MaterialCommunityIcons
                name={isSelected ? "check-circle" : "circle-outline"}
                size={24}
                color={isSelected ? colors.primary : colors.inkSubtle}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default SettingsLanguageScreen;
