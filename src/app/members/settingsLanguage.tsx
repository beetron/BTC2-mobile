import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Updates from "expo-updates";
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
  // Tracks the user's tap immediately so the radio reflects their choice --
  // `locale` itself (from context) only updates on next app launch, since
  // strings and fonts must switch together (see LocaleContext.tsx).
  const [pendingLocale, setPendingLocale] = useState<Locale>(locale);

  const handleRestartNow = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      // Most likely running in an environment where expo-updates can't
      // reload (e.g. Expo Go) -- the persistent on-screen warning below
      // still tells the user a manual restart is needed.
      console.error("Error reloading app:", error);
    }
  };

  const handleSelect = async (newLocale: Locale) => {
    setPendingLocale(newLocale);
    if (newLocale === locale) return;

    await setLocale(newLocale);
    Alert.alert(
      t("settings.language.restartTitle"),
      t("settings.language.restartMessage"),
      [
        { text: t("settings.language.laterButton"), style: "cancel" },
        { text: t("settings.language.restartNowButton"), onPress: handleRestartNow },
      ]
    );
  };

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <View className="m-6">
        <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
          {t("settings.language.title")}
        </Text>
        {OPTIONS.map((option) => {
          const isSelected = option.locale === pendingLocale;
          return (
            <TouchableOpacity
              key={option.locale}
              onPress={() => handleSelect(option.locale)}
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

        {pendingLocale !== locale && (
          <View className="flex-row items-start mt-4 bg-btc400 rounded-xl p-3">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={20}
              color="#f0c987"
              style={{ marginTop: 2 }}
            />
            <Text className="text-btc100 font-funnel-regular text-sm ml-2 flex-1">
              {t("settings.language.pendingChangeWarning")}
            </Text>
            <TouchableOpacity onPress={handleRestartNow} className="ml-2">
              <Text className="text-btc200 font-funnel-semi-bold text-sm">
                {t("settings.language.restartNowButton")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default SettingsLanguageScreen;
