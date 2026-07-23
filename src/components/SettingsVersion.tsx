import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../constants/colors";

const SettingsVersion = () => {
  const appVersion = process.env.EXPO_PUBLIC_APP_VERSION;

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <MaterialCommunityIcons
        name="information-outline"
        size={20}
        color={colors.accent}
      />
      <Text className="text-btc100 font-funnel-regular text-lg">
        {appVersion}
      </Text>
    </View>
  );
};

export default SettingsVersion;
