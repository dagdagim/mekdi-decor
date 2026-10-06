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
        burgundy: {
          50: "#FDF2F4",
          100: "#FBE6E9",
          200: "#F5C2C9",
          300: "#EE9AA7",
          400: "#DE566C",
          500: "#B82844",
          600: "#8E1730",
          700: "#6E1125",
          800: "#5B1424", // Primary brand deep burgundy
          900: "#4A0E17",
          950: "#2E070D",
        },
        gold: {
          50: "#FDFCF7",
          100: "#FAF6E6",
          200: "#F4E9C2",
          300: "#EBD998",
          400: "#DFC46A",
          500: "#D4AF37", // Champagne Gold
          600: "#C59B27",
          700: "#A47E1B",
          800: "#846219",
          900: "#6C4F17",
          950: "#3D2A08",
        },
        cream: {
          50: "#FDFBF7", // Primary warm cream background
          100: "#FAF6F0",
          200: "#F5EFEB",
          300: "#EFE7E0",
          400: "#E2D6CB",
          500: "#D0C1B3",
          600: "#B8A594",
          700: "#9B8775",
          800: "#7F6D5D",
          900: "#65574A",
        },
        charcoal: {
          50: "#F7F6F5",
          100: "#ECEAE8",
          200: "#D5D2CF",
          300: "#B5B0AB",
          400: "#8F8982",
          500: "#6E6760",
          600: "#544E47",
          700: "#3D3833",
          800: "#2B2828",
          900: "#1C1917", // Primary text
          950: "#12100F",
        },
        botanical: {
          50: "#F4F7F5",
          100: "#E5ECE7",
          200: "#C9D8CE",
          300: "#A6BEAC",
          400: "#7E9F88",
          500: "#5C8068",
          600: "#4A6A54",
          700: "#3D5A45",
          800: "#34493A",
          900: "#2C3C30",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(28, 25, 23, 0.05)",
        card: "0 10px 30px -4px rgba(74, 14, 23, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)",
        elevated: "0 20px 40px -6px rgba(74, 14, 23, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)",
        gold: "0 0 25px rgba(212, 175, 55, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
