import { Locale } from "../context/LocaleContext";

// Both locales' font files are loaded up front at boot, under separate
// family names (JA names suffixed "-ja") -- this lets locale switch live
// (see tailwind.config.js + FontVarsProvider in _layout.tsx) instead of
// requiring a restart to reload a different physical file per name.
export const FONT_MAP = {
  "funnel-bold": require("../assets/fonts/FunnelDisplay-Bold.ttf"),
  "funnel-extra-bold": require("../assets/fonts/FunnelDisplay-ExtraBold.ttf"),
  "funnel-light": require("../assets/fonts/FunnelDisplay-Light.ttf"),
  "funnel-medium": require("../assets/fonts/FunnelDisplay-Medium.ttf"),
  "funnel-regular": require("../assets/fonts/FunnelDisplay-Regular.ttf"),
  "funnel-semi-bold": require("../assets/fonts/FunnelDisplay-SemiBold.ttf"),
  "funnel-bold-ja": require("../assets/fonts/NotoSansJP-Bold.ttf"),
  "funnel-extra-bold-ja": require("../assets/fonts/NotoSansJP-ExtraBold.ttf"),
  "funnel-light-ja": require("../assets/fonts/NotoSansJP-Light.ttf"),
  "funnel-medium-ja": require("../assets/fonts/NotoSansJP-Medium.ttf"),
  "funnel-regular-ja": require("../assets/fonts/NotoSansJP-Regular.ttf"),
  "funnel-semi-bold-ja": require("../assets/fonts/NotoSansJP-SemiBold.ttf"),
};

// One CSS custom property per weight, resolving to the locale-appropriate
// registered family name -- fed into nativewind's vars() so every existing
// className="font-funnel-regular" (etc.) switches family instantly on
// locale change, without remounting.
export const getFontVars = (locale: Locale) => {
  const suffix = locale === "ja" ? "-ja" : "";
  return {
    "--font-funnel-bold": `funnel-bold${suffix}`,
    "--font-funnel-extra-bold": `funnel-extra-bold${suffix}`,
    "--font-funnel-light": `funnel-light${suffix}`,
    "--font-funnel-medium": `funnel-medium${suffix}`,
    "--font-funnel-regular": `funnel-regular${suffix}`,
    "--font-funnel-semi-bold": `funnel-semi-bold${suffix}`,
  };
};
