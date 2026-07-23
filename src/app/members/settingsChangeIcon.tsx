import {
  setAlternateAppIcon,
  resetAppIcon,
  getAppIconName,
  type AlternateAppIcons,
} from "expo-alternate-app-icons";
import { Alert, Text, View } from "react-native";
import IconButton from "../../components/IconButton";
import CustomButton from "../../components/CustomButton";
import SettingsChangeIconHeader from "../../components/SettingsChangeIconHeader";
import { icons } from "../../constants/icons";
import React, { useCallback, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";

const SettingsChangeIcon = () => {
  const { t } = useTranslation();
  const [currentIconName, setCurrentIconName] = useState<string | null>(
    getAppIconName()
  );

  // Change to alternate app icon
  const handleSetIcon = useCallback(
    async (iconName: AlternateAppIcons) => {
      try {
        const newAppIconName = await setAlternateAppIcon(iconName);
        setCurrentIconName(newAppIconName);
      } catch (error) {
        if (error instanceof Error) Alert.alert("Error", error.message);
      }
    },
    [setCurrentIconName]
  );

  // Reset to default app icon
  const handleReset = useCallback(async () => {
    try {
      await resetAppIcon();
      setCurrentIconName(null); // null is treated as default icon
    } catch (error) {
      if (error instanceof Error) Alert.alert("Error", error.message);
    }
  }, [setCurrentIconName]);

  return (
    <View className="flex-1 bg-btc500">
      <SettingsChangeIconHeader />
      <View className="flex-1 justify-center px-6 pb-10">
        <Text className="text-btc100 font-funnel-semi-bold text-2xl text-center mb-1">
          {t("settings.changeIcon.rowLabel")}
        </Text>
        <Text className="text-btc200 font-funnel-regular text-sm text-center mb-6">
          {t("settings.changeIcon.subtitle")}
        </Text>

        <View className="flex-row flex-wrap justify-center gap-6 bg-card rounded-2xl p-6">
          {icons.map(([name, source]) => (
            <IconButton
              key={name}
              name={name as AlternateAppIcons}
              source={source}
              onPress={handleSetIcon}
              selected={currentIconName === name}
            />
          ))}
        </View>

        <CustomButton
          title={t("settings.changeIcon.resetButton")}
          handlePress={handleReset}
          variant="secondary"
          containerStyles="mt-8 w-3/4 self-center"
        />
      </View>
    </View>
  );
};

export default SettingsChangeIcon;
