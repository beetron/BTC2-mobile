import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";

const _layout = () => {
  const { authState } = useAuth();
  if (authState?.authenticated === !true) {
    return <Redirect href={"/guests/Login" as any} />;
  }

  return (
    <SocketProvider>
      <Stack>
        <Stack.Screen name="conversation" options={{ headerShown: false }} />
      </Stack>
    </SocketProvider>
  );
};

export default _layout;
