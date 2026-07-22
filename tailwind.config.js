/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: [".src/app/**/*.{js,jsx,ts,tsx}", ".src/**/**/*.{js,jsx,ts,tsx}"],
  content: ["src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      width: {
        "7/10": "70%",
      },
      colors: {
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
      },
    },
    // Each resolves through a CSS var (set per-locale in FontVarsProvider,
    // src/app/_layout.tsx) to the actual registered family name, so
    // switching locale swaps every font-funnel-* usage live.
    fontFamily: {
      "funnel-bold": ["var(--font-funnel-bold)"],
      "funnel-extra-bold": ["var(--font-funnel-extra-bold)"],
      "funnel-light": ["var(--font-funnel-light)"],
      "funnel-medium": ["var(--font-funnel-medium)"],
      "funnel-regular": ["var(--font-funnel-regular)"],
      "funnel-semi-bold": ["var(--font-funnel-semi-bold)"],
    },
  },
  plugins: [],
};
