import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";

export type Locale = "en" | "ja";
const LOCALE_KEY = "locale";
const SUPPORTED_LOCALES: Locale[] = ["en", "ja"];

interface LocaleContextType {
  locale: Locale;
  // Persists the choice for next launch only -- deliberately does not
  // update the live `locale` value, so strings and fonts (which can only
  // be reloaded at boot, see src/app/_layout.tsx) always change together
  // and consistently, rather than strings switching languages instantly
  // while still rendering in the wrong script's font until restart.
  setLocale: (locale: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const detectDeviceLocale = (): Locale => {
  const languageCode = Localization.getLocales()[0]?.languageCode;
  return languageCode === "ja" ? "ja" : "en";
};

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale | null>(null);

  useEffect(() => {
    const resolveLocale = async () => {
      try {
        const stored = await SecureStore.getItemAsync(LOCALE_KEY);
        if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
          setLocaleState(stored as Locale);
          return;
        }
      } catch (error) {
        console.error("Error reading stored locale:", error);
      }
      setLocaleState(detectDeviceLocale());
    };

    resolveLocale();
  }, []);

  const setLocale = async (newLocale: Locale) => {
    await SecureStore.setItemAsync(LOCALE_KEY, newLocale);
  };

  // Keeps the splash screen up (same gating pattern as font loading in
  // src/app/_layout.tsx) until locale resolution completes.
  if (locale === null) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
