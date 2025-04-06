/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['var(--font-poppins)'],
      },
      colors: {
        'mint': {
          500: 'var(--color-mint-500)',
        },
      },
    },
  },
  plugins: [],
} 