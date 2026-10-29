import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lifepulse: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#1B7F4B", // Primary Mission LiFE Green
          800: "#115331",
          900: "#0b3821",
        },
        solar: {
          400: "#fbbf24",
          500: "#F5A623", // Accent Amber
          600: "#d97706",
        }
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Gujarati", "Noto Sans Devanagari", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
