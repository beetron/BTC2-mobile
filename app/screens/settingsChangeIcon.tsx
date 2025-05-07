import {
  setAlternateAppIcon,
  resetAppIcon,
  getAppIconName,
  type AlternateAppIcons,
} from "expo-alternate-app-icons";
import { Alert, TouchableOpacity, View } from "react-native";
import IconButton from "../components/IconButton";
import SettingsChangeIconHeader from "../components/SettingsChangeIconHeader";
import { icons } from "../../constants/icons";
import React, { useCallback, useState } from "react";
import { Text } from "react-native";

const SettingsChangeIcon = () => {
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
      <View className="flex-1 bg-btc500 m-6">
        <View className="flex-row flex-wrap justify-around gap-4 bg-btc400 rounded-xl p-4">
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
        <TouchableOpacity
          className="mt-6 p-4 bg-btc400 rounded-xl w-3/4 self-center"
          onPress={handleReset}
        >
          <Text className="font-funnel-regular text-center text-btc100 text-xl">
            Reset to Default Icon
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsChangeIcon;
