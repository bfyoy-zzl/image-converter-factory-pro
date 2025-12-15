/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skin: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          main: 'var(--color-text-main)',
          sub: 'var(--color-text-sub)',
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          border: 'var(--color-border)',
          input: 'var(--color-input)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pop': 'pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}