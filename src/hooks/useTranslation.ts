import { useCallback } from "react";
import en from "../localization/en.json";
import ja from "../localization/ja.json";
import { useLocale } from "../context/LocaleContext";

const dictionaries = { en, ja };

const getByPath = (obj: any, path: string): string | undefined =>
  path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

// Lightweight custom i18n -- no external library. Dot-path key lookup
// ("errors.noInternet") against src/localization/{en,ja}.json, with simple
// {{var}} interpolation for the handful of dynamic strings.
export const useTranslation = () => {
  const { locale } = useLocale();

  // Stable across renders (only changes if locale changes) -- many call
  // sites put `t` in a useCallback/useEffect dependency array, and a
  // freshly-recreated function every render would retrigger those.
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let value = getByPath(dictionaries[locale], key);
      if (value === undefined) {
        console.warn(`Missing translation for key "${key}" (locale: ${locale})`);
        value = key;
      }
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          value = (value as string).replace(`{{${k}}}`, String(v));
        });
      }
      return value as string;
    },
    [locale]
  );

  return { t, locale };
};
