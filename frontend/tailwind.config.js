/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#0a0a0d",
          900: "#141417",
          850: "#1b1b20",
          800: "#222228",
          700: "#2b2b32",
        },
        base: "#0a0a0d",
        canvas: "#0a0a0d",
        bg: "#141417",
        surface: "#141417",
        elevated: "#1b1b20",
        surfaceHover: "#222228",
        border: "rgba(255,255,255,0.08)",
        textPrimary: "#f2f2f2",
        textSecondary: "#a1a1aa",
        textMuted: "#6b6b73",
        primary: "#c6a96b",
        accent: "#c6a96b",
        accentGold: "#c6a96b",
        accentGoldHover: "#d4b878",
        cool: {
          300: "#e2cda3",
          400: "#d4b878",
          500: "#c6a96b",
          600: "#a5884f",
        },
      },
      backgroundImage: {
        "black-layered":
          "radial-gradient(1200px 720px at 50% -12%, rgba(26,26,31,0.56), rgba(10,10,13,0.96) 58%), linear-gradient(180deg, #0a0a0d 0%, #0f0f13 56%, #0a0a0d 100%)",
        "black-vignette":
          "radial-gradient(circle at center, rgba(0,0,0,0) 36%, rgba(0,0,0,0.5) 100%)",
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0,0,0,0.35)",
        elevated: "0 16px 44px rgba(0,0,0,0.42)",
        glowCool: "0 0 24px rgba(198,169,107,0.3)",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.10)",
      },
    },
  },
  plugins: [],
};
