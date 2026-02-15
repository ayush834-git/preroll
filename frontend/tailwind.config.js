/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0F1216",
        bg: "#131820",
        surface: "#1A2028",
        surfaceHover: "#232B35",
        border: "#32404D",
        textPrimary: "#F7EFE4",
        textSecondary: "#D8CDBE",
        textMuted: "#AA9F92",
        primary: "#C58F5C",
        accent: "#6F9EA8",
        bronze: {
          400: "#D8A777",
          500: "#C58F5C",
          600: "#A86D3F",
          700: "#8C5731",
        },
        cool: {
          400: "#8DB4BE",
          500: "#6F9EA8",
          600: "#5B848D",
          700: "#486A73",
        },
      },
      boxShadow: {
        glowBronze: "0 0 36px rgba(213,151,89,0.34)",
        glowCool: "0 0 24px rgba(111,158,168,0.28)",
      },
    },
  },
  plugins: [],
};
