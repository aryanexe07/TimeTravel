import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glass: {
          light: "rgba(255, 255, 255, 0.07)",
          card: "rgba(18, 22, 36, 0.65)",
          cardHover: "rgba(26, 32, 53, 0.8)",
          border: "rgba(255, 255, 255, 0.12)",
          borderGlow: "rgba(129, 140, 248, 0.35)",
        },
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        accent: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          purple: "#a855f7",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)",
        "glass-glow": "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.25)",
        "glass-lg": "0 12px 48px 0 rgba(0, 0, 0, 0.5)",
        "neon-purple": "0 0 25px rgba(168, 85, 247, 0.45)",
        "neon-cyan": "0 0 25px rgba(6, 182, 212, 0.45)",
        "neon-emerald": "0 0 25px rgba(16, 185, 129, 0.45)",
        "neon-rose": "0 0 25px rgba(244, 63, 94, 0.45)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
