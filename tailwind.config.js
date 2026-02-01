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
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1E40AF',
        },
        accent: {
          DEFAULT: '#14B8A6',
          light: '#2DD4BF',
        },
        background: {
          light: '#F8FAFC',
          dark: '#020617',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0F172A',
        },
        text: {
          primary: {
            light: '#0F172A',
            dark: '#E5E7EB',
          },
          secondary: {
            light: '#475569',
            dark: '#94A3B8',
          },
          muted: {
            light: '#94A3B8',
            dark: '#64748B',
          },
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#0EA5E9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      },
    },
  },
  plugins: [],
}
