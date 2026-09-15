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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // TGTG-like warm cream
        cream: {
          DEFAULT: "#F8F4F0",
          50: "#FBF9F6",
          100: "#F8F4F0",
          200: "#F0E9E1",
          300: "#E4D9CD",
        },
        // Deep muted forest / teal (TGTG)
        green: {
          50: "#F1F6F3",
          100: "#DEEAE3",
          200: "#BED5C8",
          300: "#8FB5A1",
          400: "#4A8A78",
          500: "#1F5C45",
          600: "#0B3D2E",
          700: "#0A3427",
          800: "#004D4A",
          900: "#005A57",
          950: "#03140F",
        },
        // Soft coral accent (TGTG step labels) — replaces neon amber for accents
        coral: {
          DEFAULT: "#EF8B8B",
          50: "#FDF2F1",
          100: "#FCE4E2",
          200: "#F9C9C5",
          300: "#F5A8A2",
          400: "#EF8B8B",
          500: "#E56F6F",
          600: "#D45555",
          700: "#B34444",
        },
        // Softened amber — less neon (status badges still ok)
        amber: {
          50: "#FAF6F0",
          100: "#F3EBE0",
          200: "#E6D5BC",
          300: "#D4B894",
          400: "#C49A6C",
          500: "#A67C4E",
          600: "#8A6540",
          700: "#6F5035",
          800: "#5A422E",
          900: "#4A3728",
          950: "#281C14",
        },
      },
    },
  },
  plugins: [],
};
export default config;
