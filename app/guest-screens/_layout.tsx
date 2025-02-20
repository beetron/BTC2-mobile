import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../context/AuthContext";

const _layout = () => {
  const { authState } = useAuth();
  if (authState?.authenticated === true) {
    return <Redirect href={"/(member-tabs)" as any} />;
  }

  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="Signup" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
