/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          dark: '#1A1A1A',
          light: '#FAFAFA',
          accent: {
            DEFAULT: '#0071E3',
            hover: '#0077ED',
            dark: '#0058B9',
          },
          secondary: {
            DEFAULT: '#6E6E73',
            light: '#86868B',
            dark: '#4B4B4F',
          },
          white: '#ffffff',
          softGray: '#F5F5F7',
          // Apple-inspired grayscale
          'gray': {
            50: '#F5F5F7',
            100: '#E8E8ED',
            200: '#D2D2D7',
            300: '#BDBDC2',
            400: '#A1A1A6',
            500: '#86868B',
            600: '#6E6E73',
            700: '#4B4B4F',
            800: '#323236',
            900: '#1D1D1F',
          },
          // Apple-inspired status colors
          'success': '#34C759',
          'warning': '#FF9500',
          'error': '#FF3B30',
          'info': '#5AC8FA',
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
        },
        fontFamily: {
          sans: [
            'SF Pro Display',
            'SF Pro',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
          ],
        },
        boxShadow: {
          'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
          'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
          'strong': '0 8px 30px rgba(0, 0, 0, 0.12)',
          'inner-light': 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
          'inner-medium': 'inset 0 2px 4px rgba(0, 0, 0, 0.08)',
        },
        borderRadius: {
          '3xl': '1.75rem',
          '4xl': '2rem',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-out',
          'slide-up': 'slideUp 0.5s ease-out',
          'slide-down': 'slideDown 0.5s ease-out',
          'scale-in': 'scaleIn 0.3s ease-out',
          'bounce-soft': 'bounceSoft 0.75s infinite',
          blob: "blob 7s infinite",
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(-20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          scaleIn: {
            '0%': { transform: 'scale(0.9)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' },
          },
          bounceSoft: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' },
          },
          blob: {
            "0%": {
              transform: "translate(0px, 0px) scale(1)",
            },
            "33%": {
              transform: "translate(30px, -50px) scale(1.1)",
            },
            "66%": {
              transform: "translate(-20px, 20px) scale(0.9)",
            },
            "100%": {
              transform: "translate(0px, 0px) scale(1)",
            },
          },
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
        transitionTimingFunction: {
          'apple-ease': 'cubic-bezier(0.42, 0, 0.58, 1)',
          'bounce-soft': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        },
        // Backdrop blur for glass effects
        backdropBlur: {
          'xs': '2px',
          'sm': '4px',
          'md': '8px',
          'lg': '12px',
          'xl': '16px',
          '2xl': '24px',
        },
      },
    },
    plugins: [
      require('@tailwindcss/line-clamp'),
    ],
    future: {
      hoverOnlyWhenSupported: true,
    },
  };
  