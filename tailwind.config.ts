import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mare: {
          brand: "#9676CD",
          primary: "#7E22CE",
          institutional: "#581C87",
          accent: "#2DD4BF",
          surface: "#F8FAFC",
          secondary: "#475569",
          positive: "#0F766E",
          negative: "#B23B5C",
          negativeLight: "#FCE7F3",
          salesLight: "#F3E8FF",
          fishingLight: "#CCFBF1",
          homeLight: "#F3E8FF",
          purple: "#7E22CE",
          purpleDark: "#581C87",
          purpleSoft: "#B381CD",
          purpleLight: "#F3E8FF",
          teal: "#0F766E",
          tealDark: "#0F766E",
          tealSoft: "#2DD4BF",
          tealLight: "#CCFBF1",
          yellow: "#B381CD",
          yellowDark: "#581C87",
          yellowLight: "#F3E8FF",
          ink: "#581C87",
          slate: "#475569",
          bg: "#F8FAFC",
          card: "#F8FAFC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(88, 28, 135, 0.16)",
        card: "0 2px 10px -2px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
