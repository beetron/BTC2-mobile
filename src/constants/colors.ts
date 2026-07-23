// Mirrors tailwind.config.js's theme.extend.colors -- kept in sync by hand.
// Use for RN component `color` props (icons, etc.) that can't take a className.
export const colors = {
  btc100: "#D4F1F4",
  btc200: "#75E6DA",
  btc300: "#189AB4",
  btc400: "#05445E",
  btc500: "#2a2a3c",
  accent: "#4A90D9",
  accentLight: "#B5D4F4",
  danger: "#C0494D",
  dangerBg: "#3A2E30",
  dangerBorder: "#6B3A3A",
  success: "#7BC96F",
  warning: "#f0c987",
  card: "#34344A",
} as const;
