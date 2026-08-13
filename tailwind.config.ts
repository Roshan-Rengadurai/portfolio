import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          ink: "var(--accent-ink)",
        },
        danger: "var(--danger)",
        success: "var(--success)",
      },
      maxWidth: {
        content: "56rem",
      },
      zIndex: {
        particles: "0",
        content: "10",
        hud: "40",
        nav: "50",
        modal: "100",
        boot: "200",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
