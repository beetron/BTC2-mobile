import { useState, useCallback } from "react";
import { Alert, Text, TextInput, View, Platform } from "react-native";
import useUpdateUniqueId from "@/hooks/useUpdateUniqueId";
import { useAuth } from "@/context/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import ProfileValidator from "@/utils/profileValidator";

const SettingsUniqueId = () => {
  const { authState } = useAuth();
  const currentUniqueId = authState?.user?.uniqueId;
  const [uniqueId, setUniqueId] = useState(currentUniqueId || "");
  const { updateUniqueId, isLoading } = useUpdateUniqueId();
  const { checkLength, checkAlphanumeric } = ProfileValidator();

  // Reset current nickname when switching tabs
  useFocusEffect(
    useCallback(() => {
      if (currentUniqueId) {
        setUniqueId(currentUniqueId);
      }
    }, [currentUniqueId])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    if (!checkLength(uniqueId) || !checkAlphanumeric(uniqueId)) return;

    // Send to backend API
    const success = await updateUniqueId(uniqueId);
    if (success) {
      Alert.alert("Unique ID updated");
    } else {
      Alert.alert("Error updating Unique ID");
    }
  };

  return (
    <View className="flex-grow justify-center mt-4 ml-4 max-w-[80%]">
      <Text className="font-funnel-regular text-btc100 text-l opacity-[50%]">
        Unique ID (signup & friend requests)
      </Text>
      <TextInput
        value={uniqueId}
        maxLength={20}
        autoCapitalize="none"
        multiline={true}
        onChangeText={(text) => setUniqueId(text.toLowerCase())}
        style={{
          height: 40,
          paddingBottom: 0,
          paddingTop: Platform.OS === "ios" ? 14 : 0,
        }}
        className="text-btc100 font-funnel-regular text-2xl border-b border-btc300"
      />
      <MaterialIcons
        name="save-as"
        size={26}
        color="white"
        className="absolute right-0 top-6"
        style={{ opacity: currentUniqueId === uniqueId ? 0.5 : 1 }}
        disabled={currentUniqueId === uniqueId || isLoading}
        onPress={handleOnPress}
      />
      <Text className="absolute top-0 right-0 text-btc100 text-l opacity-[50%]">
        {uniqueId.length}/20
      </Text>
    </View>
  );
};

export default SettingsUniqueId;
