import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mare: {
          purple: "#5B2A86",
          purpleDark: "#3B1A5C",
          purpleSoft: "#7C3FAE",
          purpleLight: "#F1E7FB",
          teal: "#0E9488",
          tealDark: "#0B6D64",
          tealSoft: "#3FC8B4",
          tealLight: "#C3F0E5",
          yellow: "#F7C948",
          yellowDark: "#8A6212",
          yellowLight: "#FDEEC4",
          ink: "#1F2430",
          slate: "#6B7280",
          bg: "#F6F5F8",
          card: "#F4F4F6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(59, 26, 92, 0.18)",
        card: "0 2px 10px -2px rgba(31, 36, 48, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
