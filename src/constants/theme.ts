// Single source of truth for app colors. Every token here is exposed two ways:
//   - as a Tailwind color (tailwind.config.js) that resolves through a CSS
//     var set at the root by ThemeProvider, so `bg-surface`, `text-ink`,
//     `border-border/60` etc. switch live between light and dark;
//   - as a plain hex via useThemeColors() (src/context/ThemeContext.tsx), for
//     RN props that can't take a className (icon `color`, placeholderTextColor,
//     ActivityIndicator, inline `style` where class swaps would lag).

import { TOKEN_NAMES } from "./themeTokens";

export type ColorScheme = "light" | "dark";

export const TOKENS = TOKEN_NAMES;

export type ThemeToken = (typeof TOKENS)[number];
export type ThemePalette = Record<ThemeToken, string> & {
  // Group chats: sender names are tinted by a stable hash of the sender id.
  senderColors: readonly string[];
};

export const palettes: Record<ColorScheme, ThemePalette> = {
  light: {
    bg: "#F4F8FA",
    surface: "#FFFFFF",
    surfaceMuted: "#E8EFF3",
    border: "#E1EAEF",
    divider: "#EEF3F6",
    ink: "#0F2530",
    inkMuted: "#557080",
    inkSubtle: "#8FA2B0",
    primary: "#1B7A9E",
    onPrimary: "#FFFFFF",
    primarySoft: "#E4F2F7",
    danger: "#B42F28",
    onDanger: "#FFFFFF",
    dangerSoft: "#FBEAE8",
    badge: "#D6453D",
    success: "#1F7A4D",
    warning: "#9A6100",
    bubbleOther: "#FFFFFF",
    senderColors: ["#8A3B12", "#8A2950", "#4A3B8F", "#1F6B45", "#14576F", "#7A5200"],
  },
  dark: {
    bg: "#0C1920",
    surface: "#13232B",
    surfaceMuted: "#1A2D36",
    border: "#213843",
    divider: "#1C2F38",
    ink: "#E8F1F5",
    inkMuted: "#93A9B5",
    inkSubtle: "#5E7684",
    primary: "#5BBCE0",
    onPrimary: "#04202B",
    primarySoft: "#173543",
    danger: "#F0716A",
    onDanger: "#2A0806",
    dangerSoft: "#3A1D1C",
    badge: "#E5554C",
    success: "#5CC98F",
    warning: "#F0C987",
    bubbleOther: "#172A33",
    senderColors: ["#F2B892", "#F2AECA", "#C3B8F5", "#9ED9B8", "#9FD8EC", "#F0D27A"],
  },
};

const hexToChannels = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
};

// "--c-<token>": "R G B" -- consumed by tailwind.config.js as
// rgb(var(--c-<token>) / <alpha-value>) so opacity modifiers keep working.
const buildVars = (palette: ThemePalette) =>
  Object.fromEntries(
    TOKENS.map((token) => [`--c-${token}`, hexToChannels(palette[token])])
  ) as Record<string, string>;

const COLOR_VARS: Record<ColorScheme, Record<string, string>> = {
  light: buildVars(palettes.light),
  dark: buildVars(palettes.dark),
};

export const getColorVars = (scheme: ColorScheme) => COLOR_VARS[scheme];

export const senderColorFor = (palette: ThemePalette, id: string | undefined) => {
  if (!id) return palette.inkMuted;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette.senderColors[Math.abs(hash) % palette.senderColors.length];
};
