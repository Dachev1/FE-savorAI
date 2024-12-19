/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
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
          sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
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
  };
  