import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand palette
        brand: '#0058be',
        ink: '#0b1c30',        // primary dark background
        surface: '#f8f9ff',    // light surface (portal sections, light cards)
        // Layered dark surfaces for the workspace
        panel: {
          DEFAULT: '#0f2440',  // raised card on ink
          muted: '#13294a',    // hover / secondary
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
