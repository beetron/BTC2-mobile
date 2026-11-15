import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { vars } from "nativewind";
import {
  ColorScheme,
  ThemePalette,
  getColorVars,
  palettes,
} from "../constants/theme";

export type ThemePreference = "light" | "dark" | "system";
const THEME_KEY = "themePreference";
const PREFERENCES: ThemePreference[] = ["light", "dark", "system"];
// Light is the product default -- "system" is opt-in from Settings.
const DEFAULT_PREFERENCE: ThemePreference = "light";

interface ThemeContextType {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  scheme: ColorScheme;
  colors: ThemePalette;
  // nativewind vars() style carrying every --c-* token. Applied once at the
  // root; re-apply it on content rendered in a native Modal window.
  colorVarsStyle: ReturnType<typeof vars>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [preference, setPreferenceState] = useState<ThemePreference | null>(null);
  const systemScheme = useColorScheme();

  useEffect(() => {
    const resolvePreference = async () => {
      try {
        const stored = await SecureStore.getItemAsync(THEME_KEY);
        if (stored && PREFERENCES.includes(stored as ThemePreference)) {
          setPreferenceState(stored as ThemePreference);
          return;
        }
      } catch (error) {
        console.error("Error reading stored theme preference:", error);
      }
      setPreferenceState(DEFAULT_PREFERENCE);
    };

    resolvePreference();
  }, []);

  const setPreference = async (next: ThemePreference) => {
    setPreferenceState(next);
    await SecureStore.setItemAsync(THEME_KEY, next);
  };

  const resolvedPreference = preference ?? DEFAULT_PREFERENCE;
  const scheme: ColorScheme =
    resolvedPreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : resolvedPreference;

  const value = useMemo(
    () => ({
      preference: resolvedPreference,
      setPreference,
      scheme,
      colors: palettes[scheme],
      colorVarsStyle: vars(getColorVars(scheme)),
    }),
    [resolvedPreference, scheme]
  );

  // Same splash-gating pattern as LocaleProvider -- render nothing until the
  // stored preference is known so the first frame is already the right theme.
  if (preference === null) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hex values for RN props that can't take a className.
export const useThemeColors = () => useTheme().colors;
