/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'card': '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shine': {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        'pulse-soft': {
          '0%': { boxShadow: '0 0 0 0 rgba(99,102,241,.45)' },
          '70%': { boxShadow: '0 0 0 12px rgba(99,102,241,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up .35s ease-out both',
        'shine': 'shine 1.2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 1.2s infinite',
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1',
        },
      },
    },
  },
  plugins: [],
}
