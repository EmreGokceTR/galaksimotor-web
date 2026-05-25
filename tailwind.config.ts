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
        // Tema bağlı tokenlar — globals.css'teki :root.dark / :root.light değişkenlerine bağlı.
        // Mevcut yaygın sınıflar (text-white, bg-white/X, bg-black/X, bg-brand-black, border-white/X)
        // otomatik olarak iki temada doğru renkleri verir.
        white: "rgb(var(--c-fg) / <alpha-value>)",
        black: "rgb(var(--c-fg-invert) / <alpha-value>)",
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
