import { useEffect } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { vars } from "nativewind";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { AppStateProvider } from "@/src/context/AppStateContext";
import { NetworkProvider } from "@/src/context/NetworkContext";
import { LocaleProvider, useLocale } from "@/src/context/LocaleContext";
import { FONT_MAP, getFontVars } from "@/src/constants/fonts";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

// Loads every locale's physical font files up front, regardless of the
// current locale -- renders nothing until they're ready (the splash screen
// stays up meanwhile; AuthSplashGate below decides when to hide it). Which
// one is actually displayed is decided live by FontVarsProvider below.
const FontGate = ({ children }: { children: React.ReactNode }) => {
  const [fontsLoaded, fontsError] = useFonts(FONT_MAP);

  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return <>{children}</>;
};

// Upper bound on how long the splash can stay up waiting for the session
// restore, so a stalled network never leaves the app stuck on it
const SPLASH_MAX_WAIT_MS = 5000;

// Keeps the splash screen up until the saved session restore has settled
// (authenticated true/false), so the first screen shown is the right one
// instead of flashing the Login screen. Only mounts after fonts are loaded.
const AuthSplashGate = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const isChecking = authState?.authenticated === null;

  useEffect(() => {
    if (!isChecking) {
      SplashScreen.hideAsync();
      return;
    }
    const timer = setTimeout(() => SplashScreen.hideAsync(), SPLASH_MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, [isChecking]);

  return <>{children}</>;
};

// Sets the CSS vars (see tailwind.config.js) that every font-funnel-*
// className resolves through, to the current locale's family names --
// updates live on locale change since all families are already loaded.
const FontVarsProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLocale();

  return <View style={[{ flex: 1 }, vars(getFontVars(locale))]}>{children}</View>;
};

const RootLayout = () => {
  return (
    <LocaleProvider>
      <FontGate>
        <FontVarsProvider>
          <NetworkProvider>
            <AuthProvider>
              <AuthSplashGate>
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
              </AuthSplashGate>
            </AuthProvider>
          </NetworkProvider>
        </FontVarsProvider>
      </FontGate>
    </LocaleProvider>
  );
};

export default RootLayout;
