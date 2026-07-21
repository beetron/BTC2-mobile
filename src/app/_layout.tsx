import { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { AppStateProvider } from "@/src/context/AppStateContext";
import { NetworkProvider } from "@/src/context/NetworkContext";
import { LocaleProvider, useLocale } from "@/src/context/LocaleContext";
import { getFontMap } from "@/src/constants/fonts";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

// Loads whichever physical font files back the "funnel-*" family names for
// the current locale (see src/constants/fonts.ts) -- keeps the splash
// screen up until they're ready, same gating this project already used
// before locale support existed.
const FontGate = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLocale();
  const [fontsLoaded, fontsError] = useFonts(getFontMap(locale));

  useEffect(() => {
    if (fontsError) throw fontsError;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return <>{children}</>;
};

const RootLayout = () => {
  return (
    <LocaleProvider>
      <FontGate>
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
      </FontGate>
    </LocaleProvider>
  );
};

export default RootLayout;
