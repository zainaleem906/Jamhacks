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
          400: "#00d4e8",
          500: "#00b8cc",
          600: "#009aaa",
        },
        cosmic: {
          bg: "#030b1c",
          card: "#050e23",
          border: "rgba(80,160,220,0.13)",
        },
        accent: {
          teal: "#00d4e8",
          orange: "#ff6b3a",
          gold: "#ffb347",
          purple: "#9b7fe8",
          green: "#40e080",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "score-pop": "score-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "pulse-teal": "pulse-teal 2.5s ease-in-out infinite",
        "orbit": "orbit 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
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
        "pulse-teal": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,212,232,0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(0,212,232,0)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(120px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(120px) rotate(-360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
