import { useState, useCallback } from "react";
import { Alert, Text, TextInput, View, Platform } from "react-native";
import useUpdateNickname from "@/hooks/useUpdateNickname";
import { useAuth } from "@/context/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";

const SettingsUniqueId = () => {
  const { authState } = useAuth();
  const currentUniqueId = authState?.user?.uniqueId;
  const [uniqueId, setUniqueId] = useState(currentUniqueId || "");

  return (
    <View className="flex-grow justify-center mt-4 ml-4 max-w-[80%]">
      <Text className="font-funnel-regular text-btc100 text-l opacity-[50%]">
        Unique ID (signup & friend requests)
      </Text>
      <TextInput
        value={uniqueId}
        maxLength={20}
        multiline={true}
        onChangeText={(text) => setUniqueId(text)}
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
        disabled={currentUniqueId === uniqueId}
        // disabled={currentUniqueId === uniqueId || isLoading}
        // onPress={handleOnPress}
      />
    </View>
  );
};

export default SettingsUniqueId;
