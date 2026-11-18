/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: '#17251F',
        moss: '#A5C978',
        forest: '#344B35',
        cream: '#F5F0E6',
        forestLight: '#3f5b40',
        carbonCard: '#1e2e28'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
