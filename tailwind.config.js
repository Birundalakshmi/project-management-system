/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#f8fafc",
          dots: "#e2e8f0",
        },
        surface: {
          DEFAULT: "#ffffff",
          hover: "#f1f5f9",
        },
        primary: {
          DEFAULT: "#7c3aed",
          dark: "#6d28d9",
          light: "#a78bfa",
          bg: "#f3e8ff",
        },
        textColor: {
          main: "#0f172a",
          muted: "#64748b",
          light: "#94a3b8",
        },
        badge: {
          high: { text: "#ef4444", bg: "#fef2f2" },
          medium: { text: "#f59e0b", bg: "#fffbeb" },
          low: { text: "#3b82f6", bg: "#eff6ff" },
          tag: { text: "#0ea5e9", bg: "#e0f2fe" }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-up': 'fade-up 0.3s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

