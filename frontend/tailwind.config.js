/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f19",
        surface: "#111827",
        card: "#1f2937",
        primary: "#6366f1",
        accent: "#a855f7",
      },
    },
  },
  plugins: [],
}