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
          950: "#0E1116",
          900: "#141922",
          850: "#1A212C",
          800: "#202A36",
          700: "#2A3442",
        },
        canvas: "#0E1116",
        bg: "#141922",
        surface: "#1A212C",
        surfaceHover: "#202A36",
        border: "#2A3442",
        textPrimary: "#E7ECF3",
        textSecondary: "#B5C0CF",
        textMuted: "#8B97A8",
        primary: "#6E8FA3",
        accent: "#6E8FA3",
        cool: {
          300: "#A3BAC8",
          400: "#89A5B6",
          500: "#6E8FA3",
          600: "#587788",
        },
      },
      boxShadow: {
        panel:
          "0 1px 0 rgba(255,255,255,0.03), 0 10px 30px rgba(0,0,0,0.35)",
        elevated:
          "0 1px 0 rgba(255,255,255,0.05), 0 14px 40px rgba(0,0,0,0.45)",
        glowCool: "0 0 24px rgba(110,143,163,0.32)",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.10)",
      },
    },
  },
  plugins: [],
};
