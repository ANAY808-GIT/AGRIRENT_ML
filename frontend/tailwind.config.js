/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          dark: '#14532d',     // Dark green
          primary: '#15803d',  // Forest green
          medium: '#16a34a',   // Emerald
          light: '#22c55e',    // Leaf green
          lime: '#84cc16',     // Lime accent
          cream: '#fcfbf7',    // Warm cream background
          sand: '#f5f0e6',     // Sand card tone
          harvest: '#d97706',  // Amber harvest gold
          border: '#e2e8f0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

