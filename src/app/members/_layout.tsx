import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert } from "react-native";
import { Redirect, router, Tabs, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import React from "react";
import HeaderPrimary from "../../components/HeaderPrimary";
import { SocketProvider } from "@/src/context/SocketContext";

const TabLayout = () => {
  const { authState, onLogout } = useAuth();

  if (authState?.authenticated !== true) {
    return <Redirect href="/guests/Login" />;
  }

  return (
    <SocketProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="removeFriend" />
        <Stack.Screen name="settingsChangeIcon" />
      </Stack>
    </SocketProvider>
  );
};

export default TabLayout;
