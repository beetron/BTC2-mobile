import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Redirect, Slot, SplashScreen } from "expo-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  // Load custom fonts
  const [fontsLoaded, fontsError] = useFonts({
    FunnelDisplay: require("../assets/fonts/FunnelDisplay-VariableFont_wght.ttf"),
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
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/" />;
  }
};

export default RootLayout;
