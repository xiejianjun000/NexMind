/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'indigo-600': '#6366f1',
        'pink-500': '#ec4899',
        'indigo-950': '#1e1b4b',
      },
    },
  },
  plugins: [],
}
