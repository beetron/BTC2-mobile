import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const SettingsIcon = () => {
  const router = useRouter();
  return (
    <View className="w-full bg-btc500 p-4">
      <TouchableOpacity
        onPress={() => router.push("../screens/settingsChangeIcon")}
      >
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-btc100 font-funnel-regular text-2xl">
            Change App Icon
          </Text>
          <AntDesign name="arrowright" size={28} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsIcon;
