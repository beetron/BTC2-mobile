import { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { vars } from "nativewind";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { AppStateProvider } from "@/src/context/AppStateContext";
import { NetworkProvider } from "@/src/context/NetworkContext";
import { LocaleProvider, useLocale } from "@/src/context/LocaleContext";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
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

// Sets the CSS vars (see tailwind.config.js) that every font-funnel-* and
// color className resolves through: the current locale's font family names
// and the current theme's color channels. Both update live (locale switch,
// theme switch, or the OS appearance changing under "system").
const StyleVarsProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLocale();
  const { scheme, colors, colorVarsStyle } = useTheme();

  // Native root background -- what shows behind screens during transitions
  // and keyboard animations, so it never flashes the other theme's color.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
  }, [colors.bg]);

  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.bg },
        vars(getFontVars(locale)),
        colorVarsStyle,
      ]}
    >
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {children}
    </View>
  );
};

const ThemedStack = () => {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="members" />
      <Stack.Screen name="guests" />
      <Stack.Screen name="index" />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocaleProvider>
        <ThemeProvider>
          <FontGate>
            <StyleVarsProvider>
              <NetworkProvider>
                <AuthProvider>
                  <AuthSplashGate>
                    <AppStateProvider>
                      <KeyboardProvider>
                        <ThemedStack />
                      </KeyboardProvider>
                    </AppStateProvider>
                  </AuthSplashGate>
                </AuthProvider>
              </NetworkProvider>
            </StyleVarsProvider>
          </FontGate>
        </ThemeProvider>
      </LocaleProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
