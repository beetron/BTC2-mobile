/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      btc100: "#D4F1F4",
      btc200: "#75E6DA",
      btc300: "#189AB4",
      btc400: "#05445E",
    },
    extend: {},
  },
  plugins: [],
};
