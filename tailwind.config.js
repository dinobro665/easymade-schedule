// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
safelist: [
  "bg-black",
  "bg-gray-900",
  "text-white",
  "font-bold",
  "scale-105",
  "shadow-md",
  "bg-white",
  "bg-gray-100",
  "bg-green-100",
  "bg-yellow-100"
],

  theme: {
    extend: {},
  },
  plugins: [],
}
