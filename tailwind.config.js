/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial JIPD 2026 (extraída da logo da comissão)
        brand: {
          DEFAULT: '#0552CB', // azul royal da logo
          dark: '#0343A6',
          deep: '#10306E',
          navy: '#182750',
          ink: '#0E141D',
          steel: '#5A6C8C',
          mist: '#A3B4CE',
          paper: '#EFF5F9',
          light: '#4D8DF7',
        },
        live: '#EF4444',
        scheduled: '#0552CB',
        finished: '#5A6C8C',
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'sans-serif'],
        sans: ['"General Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 48, 110, 0.08), 0 4px 16px rgba(16, 48, 110, 0.06)',
        glow: '0 0 24px rgba(5, 82, 203, 0.35)',
      },
      animation: {
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
