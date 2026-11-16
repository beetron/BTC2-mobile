import React, { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import AuthCheckingScreen from "../../components/AuthCheckingScreen";
import { useThemeColors } from "../../context/ThemeContext";

const GuestsLayout = () => {
  const { authState } = useAuth();
  const params = useLocalSearchParams();
  const colors = useThemeColors();

  // Force remount when reset param is present
  useEffect(() => {
    if (params.reset) {
      // Clear any tab-related state here if needed
      console.log("Forcing login screen remount");
    }
  }, [params.reset]);

  // Still restoring the saved session: don't show Login yet
  if (authState?.authenticated === null) {
    return <AuthCheckingScreen />;
  }

  if (authState?.authenticated === true) {
    return <Redirect href={"/members" as any} />;
  }

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="Signup" options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" options={{ headerShown: false }} />
      <Stack.Screen name="ForgotUsername" options={{ headerShown: false }} />
      <Stack.Screen name="Eula" options={{ headerShown: false }} />
    </Stack>
  );
};

export default GuestsLayout;
