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
    <View className="flex-grow justify-center ml-4 max-w-[80%]">
      <Text
        style={{
          height: 40,
          paddingBottom: 0,
          paddingTop: Platform.OS === "ios" ? 14 : 0,
        }}
        className="text-btc100 font-funnel-regular text-2xl"
      >
        Username: {currentUsername}
      </Text>
      <Text className="font-funnel-regular text-btc100 text-l opacity-[50%] border-b border-btc100 pb-2">
        *you cannot change your username*
      </Text>
    </View>
  );
};

export default SettingsNickname;
