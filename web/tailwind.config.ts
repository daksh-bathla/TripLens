import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
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
        'shimmer': 'shimmer 1.8s linear infinite',
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(0,88,190,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(0,88,190,0.3)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
