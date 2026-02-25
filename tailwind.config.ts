import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        spectral: ["var(--font-spectral)", "Georgia", "serif"],
        mono: ["SF Mono", "Monaco", "Inconsolata", "Fira Mono", "monospace"],
      },
      colors: {
        positive: "#16a34a",
        negative: "#dc2626",
        neutral: "#6b7280",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
