/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      width: {
        "7/10": "70%",
      },
    },
    colors: {
      btc100: "#D4F1F4",
      btc200: "#75E6DA",
      btc300: "#189AB4",
      btc400: "#05445E",
    },
    fontFamily: {
      "funnel-bold": ["funnel-bold"],
      "funnel-extra-bold": ["funnel-extra-bold"],
      "funnel-light": ["funnel-light"],
      "funnel-medium": ["funnel-medium"],
      "funnel-regular": ["funnel-regular"],
      "funnel-semi-bold": ["funnel-semi-bold"],
    },
    extend: {},
  },
  plugins: [],
};
