import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { SocketProvider } from "@/src/context/SocketContext";

const _layout = () => {
  const { authState } = useAuth();
  if (authState?.authenticated === !true) {
    return <Redirect href={"/guests/Login" as any} />;
  }

  return (
    <SocketProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="conversation" />
        <Stack.Screen name="removeFriend" />
        <Stack.Screen name="settingsChangeIcon" />
      </Stack>
    </SocketProvider>
  );
};

export default _layout;
