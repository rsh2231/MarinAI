import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Next.js App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // Pages Router
    "./components/**/*.{js,ts,jsx,tsx}", // 컴포넌트 폴더
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue-600
          hover: "#1e40af",   // blue-800
          light: "#dbeafe",   // blue-200
        },
        background: "#f9fbfc",
        foreground: "#111827",
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
        DEFAULT: "0.5rem", // 둥근 모서리 기본값
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
