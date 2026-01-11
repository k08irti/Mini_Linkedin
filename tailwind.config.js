/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0a66c2',
          gray: '#f3f2ef',
          dark: '#1d2226'
        }
      }
    },
  },
  plugins: [],
}