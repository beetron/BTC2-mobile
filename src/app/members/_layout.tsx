import { Redirect, router, Tabs, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import React from "react";
import { SocketProvider } from "@/src/context/SocketContext";
import AuthCheckingScreen from "@/src/components/AuthCheckingScreen";
import { useThemeColors } from "@/src/context/ThemeContext";
import useServerFeatures from "@/src/hooks/useServerFeatures";

// Loads the API's feature flags (GET /config) for the signed-in session
const ServerFeaturesLoader = () => {
  useServerFeatures();
  return null;
};

const TabLayout = () => {
  const { authState } = useAuth();
  const colors = useThemeColors();

  // Still restoring the saved session (e.g. app opened from a notification):
  // wait instead of bouncing through the Login screen
  if (authState?.authenticated === null) {
    return <AuthCheckingScreen />;
  }

  if (authState?.authenticated !== true) {
    return <Redirect href="/guests/Login" />;
  }

  return (
    <SocketProvider>
      <ServerFeaturesLoader />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="friendsList" />
        <Stack.Screen name="blockedFriend" />
        <Stack.Screen name="settingsChangeIcon" />
        <Stack.Screen name="createGroup" />
        <Stack.Screen name="groupSettings" />
        <Stack.Screen name="settingsLanguage" />
      </Stack>
    </SocketProvider>
  );
};

export default TabLayout;
