import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // brand-yellow her iki temada da aynı altın sarı
        // brand-black tema değişkenine bağlı: dark=#0A0A0B, light=#F4F4F5
        brand: {
          yellow: "#FFD700",
          black: "rgb(var(--c-bg) / <alpha-value>)",
        },
        surface: "rgb(var(--c-surface) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
