import { useEffect } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { vars } from "nativewind";
import { AuthProvider } from "@/src/context/AuthContext";
import { AppStateProvider } from "@/src/context/AppStateContext";
import { NetworkProvider } from "@/src/context/NetworkContext";
import { LocaleProvider, useLocale } from "@/src/context/LocaleContext";
import { FONT_MAP, getFontVars } from "@/src/constants/fonts";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

// Loads every locale's physical font files up front, regardless of the
// current locale -- keeps the splash screen up until they're ready, same
// gating this project already used before locale support existed. Which
// one is actually displayed is decided live by FontVarsProvider below.
const FontGate = ({ children }: { children: React.ReactNode }) => {
  const [fontsLoaded, fontsError] = useFonts(FONT_MAP);

  useEffect(() => {
    if (fontsError) throw fontsError;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

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
          </NetworkProvider>
        </FontVarsProvider>
      </FontGate>
    </LocaleProvider>
  );
};

export default RootLayout;
