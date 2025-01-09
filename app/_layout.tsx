import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";

const RootLayout = () => {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }} // Hide header for (tabs) screen
        />
      </Stack>
    </AuthProvider>
  );
};

export default RootLayout;
