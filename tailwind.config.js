const { TOKEN_NAMES } = require("./src/constants/themeTokens");

// Every app color resolves through a CSS var set at the root by
// ThemeProvider (src/context/ThemeContext.tsx) from src/constants/theme.ts,
// so one class (`bg-surface`, `text-ink`) works in both light and dark, and
// opacity modifiers (`bg-ink/40`) keep working via <alpha-value>.
const themeColors = Object.fromEntries(
  TOKEN_NAMES.map((token) => [token, `rgb(var(--c-${token}) / <alpha-value>)`])
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      width: {
        "7/10": "70%",
      },
      colors: themeColors,
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
