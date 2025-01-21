import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Redirect, Slot, SplashScreen } from "expo-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "../global.css";

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
      <Slot />
      <RootLayoutAuth />
    </AuthProvider>
  );
};

const RootLayoutAuth = () => {
  const { authState, onLogout } = useAuth();

  // REMOVE AFTER TESTING
  console.log(authState);

  if (authState?.authenticated === true) {
    return <Redirect href={"/(tabs)" as any} />;
  } else {
    return <Redirect href="/" />;
  }
};

export default RootLayout;
