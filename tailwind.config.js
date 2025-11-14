/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'escr-red': '#C62828',
        'escr-yellow': '#FFCC00',
        'escr-orange': '#F57C00',
        'neutral-white': '#FFFFFF',
        'neutral-gray': '#F5F5F5',
      },
      borderRadius: {
        lg: '1rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
