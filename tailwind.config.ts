import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1e40af",
          light: "#dbeafe",
        },
        background: {
          light: "#f9fbfc",
          dark: "#121212",
        },
        foreground: {
          light: "#111827",
          dark: "#e0e0e0",
        },
        danger: "#ef4444",
        accent: "#eff6ff",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans KR"',
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
