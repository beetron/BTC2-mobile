import { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { AppStateProvider } from "@/src/context/AppStateContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  // Load custom fonts
  const [fontsLoaded, fontsError] = useFonts({
    "funnel-bold": require("../assets/fonts/FunnelDisplay-Bold.ttf"),
    "funnel-extra-bold": require("../assets/fonts/FunnelDisplay-ExtraBold.ttf"),
    "funnel-light": require("../assets/fonts/FunnelDisplay-Light.ttf"),
    "funnel-medium": require("../assets/fonts/FunnelDisplay-Medium.ttf"),
    "funnel-regular": require("../assets/fonts/FunnelDisplay-Regular.ttf"),
    "funnel-semi-bold": require("../assets/fonts/FunnelDisplay-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsError) throw fontsError;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <AuthProvider>
      <AppStateProvider>
        <KeyboardProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="members" />
            <Stack.Screen name="guests" />
            <Stack.Screen name="index" />
            <Stack.Screen name="screens" />
          </Stack>
        </KeyboardProvider>
      </AppStateProvider>
    </AuthProvider>
  );
};

export default RootLayout;
