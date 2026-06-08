/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      primary: '#0058be',
      accent: '#0058be',
      surface: '#f8f9ff',
      card: '#ffffff',
      // Map all used tailwind colors to the 4 requested hex codes
      slate: {
        50: '#f8f9ff',
        100: '#f8f9ff',
        200: '#f8f9ff',
        300: '#f8f9ff',
        400: '#0058be',
        500: '#0b1c30',
        600: '#0b1c30',
        700: '#0b1c30',
        800: '#0b1c30',
        900: '#0b1c30',
      },
      blue: {
        50: '#f8f9ff',
        100: '#f8f9ff',
        200: '#f8f9ff',
        300: '#0058be',
        400: '#0058be',
        500: '#0058be',
        600: '#0058be',
        700: '#0058be',
        800: '#0058be',
        900: '#0b1c30',
      },
      sky: {
        50: '#f8f9ff',
        100: '#f8f9ff',
      }
    },
    extend: {
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
