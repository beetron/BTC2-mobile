import { Redirect, router, Tabs, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import React from "react";
import HeaderPrimary from "../../components/HeaderPrimary";
import { SocketProvider } from "@/src/context/SocketContext";
import AuthCheckingScreen from "@/src/components/AuthCheckingScreen";

const TabLayout = () => {
  const { authState, onLogout } = useAuth();

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="removeFriend" />
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
