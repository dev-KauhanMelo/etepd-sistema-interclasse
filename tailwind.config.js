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
        // ===== Modo Arena (redesign 2026): tema escuro do site público =====
        arena: {
          bg: '#0B0F19',    // fundo de página
          deep: '#0A0E16',  // topbar e bottom-nav
          panel: '#121A2B', // cards/superfícies
          ghost: '#0F1522', // card "fantasma" (agendados)
          text: '#EFF5F9',  // texto principal
          muted: '#8FA0BF', // secundário (6.6:1 no panel)
          dim: '#66738C',   // SÓ rótulo grande/bold ou inativo (3.6:1)
        },
        accent: '#4D8DF7',  // acento frio (tags MASC, kickers)
        live: '#FF3B3B',
        scheduled: '#0552CB',
        finished: '#5A6C8C',
        // Amarelo do placar de mesa, usado como "ouro" nas telas escuras
        // (chaveamento e classificação por pontos).
        gold: '#F5EA15',
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'sans-serif'],
        sans: ['"General Sans"', 'sans-serif'],
        // Tipografia das telas de torneio (tema escuro)
        'bracket-display': ['Anton', 'sans-serif'],
        bracket: ['Rajdhani', 'sans-serif'],
        // Fontes locais do JIPD (self-hosted em /public/fonts)
        varsity: ['"Varsity JIPD"', 'Anton', 'sans-serif'],   // títulos de tela
        jersey: ['"Jersey JIPD"', 'Anton', 'sans-serif'],     // SÓ números
        body: ['Utendo', '"General Sans"', 'sans-serif'],     // nomes e leitura
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 48, 110, 0.08), 0 4px 16px rgba(16, 48, 110, 0.06)',
        glow: '0 0 24px rgba(5, 82, 203, 0.35)',
      },
      animation: {
        'pop-in': 'pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
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
