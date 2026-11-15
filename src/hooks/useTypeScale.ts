import { useLocale } from "../context/LocaleContext";

// One place for the per-locale type ramp. Noto Sans JP renders visibly
// larger than Funnel Display at the same nominal size (and Japanese strings
// are often longer), so most roles drop one step in Japanese. Components use
// these instead of their own `locale === "ja" ? ... : ...` ternaries.
//
// Line height is deliberately left to the font's own metrics -- a fixed
// lineHeight clips Noto's taller ascenders/descenders.
const SCALE = {
  en: {
    largeTitle: "text-[30px] font-funnel-semi-bold",
    title: "text-lg font-funnel-semi-bold",
    body: "text-base font-funnel-regular",
    bodyStrong: "text-base font-funnel-semi-bold",
    label: "text-sm font-funnel-medium",
    caption: "text-xs font-funnel-regular",
    sectionHeader: "text-[13px] font-funnel-semi-bold uppercase tracking-wider",
    button: "text-[17px] font-funnel-semi-bold",
  },
  ja: {
    largeTitle: "text-[26px] font-funnel-bold",
    title: "text-[17px] font-funnel-semi-bold",
    body: "text-[15px] font-funnel-regular",
    bodyStrong: "text-[15px] font-funnel-semi-bold",
    label: "text-[13px] font-funnel-medium",
    caption: "text-[11px] font-funnel-regular",
    // No uppercase/tracking in Japanese -- both are meaningless for kana/kanji
    // and letter-spacing makes mixed JA/latin headers look broken.
    sectionHeader: "text-[12px] font-funnel-semi-bold",
    button: "text-base font-funnel-semi-bold",
  },
} as const;

export type TypeRole = keyof (typeof SCALE)["en"];

export const useTypeScale = () => {
  const { locale } = useLocale();
  return SCALE[locale];
};

// Numeric body size for components that only take a `style` (e.g. Autolink,
// which NativeWind doesn't style through className). Matches `body` above.
const BODY_FONT_SIZE = { en: 16, ja: 15 } as const;

export const useBodyFontSize = () => {
  const { locale } = useLocale();
  return BODY_FONT_SIZE[locale];
};
