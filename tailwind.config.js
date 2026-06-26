/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0EA5B7',
          dark: '#0B7E8C',
          light: '#5FD0DE',
        },
        live: '#EF4444',
        scheduled: '#3B82F6',
        finished: '#64748B',
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
