/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        border: "rgb(var(--border))",
        background: "rgb(var(--bg))",
        foreground: "rgb(var(--fg))",
        muted: {
          DEFAULT: "rgb(var(--bg-3))",
          foreground: "rgb(var(--fg-2))",
        },
        card: {
          DEFAULT: "rgb(var(--bg-2))",
          foreground: "rgb(var(--fg))",
        },
        brand: {
          DEFAULT: "rgb(var(--brand))",
          light: "rgb(var(--brand-light))",
          dark: "rgb(var(--brand-dark))",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
