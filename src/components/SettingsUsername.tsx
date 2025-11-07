import { useState, useCallback } from "react";
import { Alert, Text, TextInput, View, Platform, Keyboard } from "react-native";
import useUpdateNickname from "@/src/hooks/useUpdateNickname";
import { useAuth } from "@/src/context/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";

const SettingsNickname = () => {
  const { authState } = useAuth();
  const currentUsername = authState?.user?.username;

  return (
    <View className="flex-grow justify-center max-w-[80%]">
      <View className="flex-grow justify-center ml-4 max-w-[80%] mt-4">
        <Text className="font-funnel-regular text-btc100 text-l opacity-[80%]">
          Current Username
        </Text>
        <Text
          style={{
            height: 40,
            textAlignVertical: "center",
          }}
          className="text-btc100 font-funnel-regular text-2xl"
        >
          {currentUsername}
        </Text>
      </View>
    </View>
  );
};

export default SettingsNickname;
