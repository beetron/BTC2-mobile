import { Locale } from "../context/LocaleContext";

// Same "funnel-*" keys regardless of locale -- every existing
// className="font-funnel-regular" (etc.) across the app keeps working
// unchanged; only which physical font file backs that name changes here,
// based on locale, at app boot.
export const getFontMap = (locale: Locale) => {
  if (locale === "ja") {
    return {
      "funnel-bold": require("../assets/fonts/NotoSansJP-Bold.ttf"),
      "funnel-extra-bold": require("../assets/fonts/NotoSansJP-ExtraBold.ttf"),
      "funnel-light": require("../assets/fonts/NotoSansJP-Light.ttf"),
      "funnel-medium": require("../assets/fonts/NotoSansJP-Medium.ttf"),
      "funnel-regular": require("../assets/fonts/NotoSansJP-Regular.ttf"),
      "funnel-semi-bold": require("../assets/fonts/NotoSansJP-SemiBold.ttf"),
    };
  }

  return {
    "funnel-bold": require("../assets/fonts/FunnelDisplay-Bold.ttf"),
    "funnel-extra-bold": require("../assets/fonts/FunnelDisplay-ExtraBold.ttf"),
    "funnel-light": require("../assets/fonts/FunnelDisplay-Light.ttf"),
    "funnel-medium": require("../assets/fonts/FunnelDisplay-Medium.ttf"),
    "funnel-regular": require("../assets/fonts/FunnelDisplay-Regular.ttf"),
    "funnel-semi-bold": require("../assets/fonts/FunnelDisplay-SemiBold.ttf"),
  };
};
