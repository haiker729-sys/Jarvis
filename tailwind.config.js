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
        jarvis: {
          cyan: '#00BEFF',
          blue: '#2563EB',
          dark: '#070914',
          card: 'rgba(20, 27, 61, 0.65)',
        },
        sunset: {
          primary: '#FF6A3D',
          rose: '#F43F5E',
          purple: '#8B5CF6',
          bg: '#FFF0EA',
          card: 'rgba(255, 242, 236, 0.85)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        }
      }
    },
  },
  plugins: [],
}
