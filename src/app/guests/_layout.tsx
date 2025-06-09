import React, { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams } from "expo-router";

const _layout = () => {
  const { authState } = useAuth();
  const params = useLocalSearchParams();

  // Force remount when reset param is present
  useEffect(() => {
    if (params.reset) {
      // Clear any tab-related state here if needed
      console.log("Forcing login screen remount");
    }
  }, [params.reset]);

  if (authState?.authenticated === true) {
    return <Redirect href={"/members" as any} />;
  }

  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="Signup" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
