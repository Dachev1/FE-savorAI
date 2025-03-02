/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#111111',
        light: '#f9f9f9',
        accent: '#007AFF',
        secondary: '#555555', 
        white: '#ffffff',
        softGray: '#EAEAEA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0px 10px 30px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
} 