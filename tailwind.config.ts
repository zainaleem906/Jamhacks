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
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        eco: {
          bg: "#f0fdf4",
          card: "#ffffff",
          border: "#bbf7d0",
          glow: "transparent",
          muted: "#dcfce7",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      animation: {
        "pulse-green": "pulse-green 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "score-pop": "score-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(34, 197, 94, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "score-pop": {
          "0%": { transform: "scale(0) translateY(0)", opacity: "0" },
          "60%": { transform: "scale(1.2) translateY(-20px)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(-40px)", opacity: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { textShadow: "0 0 10px rgba(34, 197, 94, 0.5)" },
          "50%": { textShadow: "0 0 20px rgba(34, 197, 94, 0.9)" },
        },
      },
      backgroundImage: {
        "eco-grid": "linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "eco-grid": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
