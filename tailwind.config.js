/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        almarwa: {
          50: '#fff1f6',
          100: '#ffe4ee',
          200: '#fecddf',
          300: '#fca5c5',
          400: '#f76b9e',
          500: '#e91e63',
          600: '#d81b60', // Primary Almarwa Pink
          700: '#c2185b',
          800: '#a2154d',
          900: '#871644',
          gold: '#D4AF37',
          goldHover: '#B89628',
          goldLight: '#FFF9E6',
          dark: '#1E1B1D',
          darkCard: '#2B2629'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
      },
      boxShadow: {
        'pink': '0 10px 30px -5px rgba(216, 27, 96, 0.25)',
        'pink-lg': '0 20px 40px -10px rgba(216, 27, 96, 0.35)',
        'gold': '0 10px 25px -5px rgba(212, 175, 55, 0.3)',
      }
    },
  },
  plugins: [],
}
