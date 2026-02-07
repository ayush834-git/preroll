/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0B",
        surface: "#131316",
        surfaceHover: "#1A1A1F",
        border: "#242428",
        textPrimary: "#F5F5F7",
        textSecondary: "#A1A1AA",
        textMuted: "#71717A",
        primary: "#7C7CFF",
        accent: "#FF4D8D",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124,124,255,0.35)",
      },
    },
  },
  plugins: [],
};
