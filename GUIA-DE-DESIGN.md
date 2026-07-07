# Guia de Design — JIPD 2026 🎨

Este guia te ensina a mudar **qualquer coisa visual** do site: cor, tamanho, fonte, espaçamento, animação, texto. Sem precisar saber React nem Tailwind antes — tudo explicado do zero.

> Complementa o `GUIA-DO-CODIGO.md` (que explica o que cada arquivo *faz*). Este aqui explica como *mudar a aparência*.

---

## 1. Como o visual do site funciona (2 minutos de teoria)

O site é feito de **componentes** — arquivos `.jsx` que são "peças" reutilizáveis (um card, um botão, o placar). Dentro deles, o visual é controlado por **classes do Tailwind** escritas direto no HTML:

```jsx
<p className="text-sm font-bold text-brand-deep">Olá!</p>
```

Cada palavra dentro de `className` é uma instrução de estilo:
- `text-sm` → texto pequeno
- `font-bold` → negrito
- `text-brand-deep` → cor azul-profunda da nossa paleta

**Pra mudar o visual de algo, você troca/adiciona/remove essas palavrinhas.** Salvou o arquivo com `npm run dev` rodando → o navegador atualiza sozinho na hora.

Existem só **3 lugares** onde mora o design:

| Lugar | O que tem lá |
|---|---|
| `className="..."` dentro dos arquivos `.jsx` | 95% do design (cores, tamanhos, espaços de cada elemento) |
| `tailwind.config.js` | A paleta de cores `brand` e as fontes — mudar aqui muda o site INTEIRO |
| `src/index.css` | Efeitos especiais: animações, o placar de mesa, o gradiente do hero |

---

## 2. Dicionário Tailwind (cola isso na parede)

### Tamanho de texto
`text-[10px]` → `text-xs` → `text-sm` → `text-base` → `text-lg` → `text-xl` → `text-2xl` ... até `text-9xl`
(do menor pro maior — quer um título maior? troca `text-2xl` por `text-4xl`)

### Peso da fonte
`font-medium` → `font-semibold` → `font-bold` → `font-extrabold` → `font-black`

### Espaçamento (a regra dos ×4)
O número multiplica por 4 pixels: `p-4` = 16px de padding.
- `p-4` → espaço interno em todos os lados
- `px-4` / `py-2` → só horizontal / só vertical
- `pt-6` `pb-2` `pl-3` `pr-3` → top, bottom, left, right
- `m-4`, `mt-6`, `mx-auto` → margem externa (`mx-auto` = centraliza)
- `gap-3` → espaço entre itens de um flex/grid

### Largura e altura
- `w-10 h-10` → 40×40px (regra dos ×4 de novo)
- `w-full` → largura total | `h-screen` → altura da tela
- `w-[52px]` → valor exato entre colchetes, quando os padrões não servem

### Cantos, bordas e sombras
- `rounded-lg` → `rounded-xl` → `rounded-2xl` → `rounded-3xl` → `rounded-full` (círculo/pílula)
- `border` + `border-brand-mist/40` → borda + cor (o `/40` é transparência: 40%)
- `shadow-sm` / `shadow-card` (nossa sombra customizada) / `shadow-glow` (brilho azul)

### Cores
`bg-` = fundo, `text-` = texto, `border-` = borda. Junta com o nome da cor:
- **Nossas cores** (definidas no `tailwind.config.js`): `bg-brand`, `text-brand-navy`, `border-brand-mist`...
- Cores prontas do Tailwind: `bg-red-500`, `text-amber-400`, `bg-emerald-100`...
- Transparência: `bg-brand/10` = azul com 10% de opacidade (fundos suaves!)

### Organização (flex)
- `flex items-center justify-between` → itens lado a lado, alinhados no meio, espalhados
- `flex-col` → empilhados na vertical
- `flex-1` → "ocupa o espaço que sobrar"
- `grid grid-cols-3 gap-3` → grade de 3 colunas

### Estados e animação
- `hover:bg-brand-dark` → cor quando o mouse passa em cima
- `active:scale-95` → encolhe 5% quando aperta (efeito de botão físico)
- `transition` → faz qualquer mudança ser suave em vez de instantânea
- `animate-pop-in` → nossa animação de entrada (definida no `tailwind.config.js`)

### Truque pra testar rápido
Abre o site, aperta **F12 → ícone de celular** (testa como mobile!) → clica com o direito num elemento → **Inspecionar**. Dá pra editar as classes ali ao vivo e ver o resultado antes de mexer no arquivo.

---

## 3. Mudar as CORES do site inteiro

Abre o **`tailwind.config.js`**. A paleta JIPD está aí:

```js
brand: {
  DEFAULT: '#0552CB', // azul royal — botões, links, destaques
  dark:    '#0343A6', // hover dos botões
  deep:    '#10306E', // textos escuros importantes
  navy:    '#182750', // azul marinho — títulos, fundos escuros
  ink:     '#0E141D', // quase preto
  steel:   '#5A6C8C', // textos secundários (cinza-azulado)
  mist:    '#A3B4CE', // bordas e detalhes suaves
  paper:   '#EFF5F9', // fundo do site (azul-gelo)
  light:   '#4D8DF7', // azul claro sobre fundos escuros
},
```

Trocou um código hex aqui → **todo lugar** que usa aquela cor muda junto. Exemplo: quer o site verde? Troca `DEFAULT: '#0552CB'` por `'#0BA84A'` e pronto, botões, abas ativas e links mudam de uma vez.

O **gradiente azul do hero** e a **cor amarela do placar** são exceções — moram no `src/index.css` (procura por `#0552CB` e `#F5EA15` lá).

---

## 4. Mudar as FONTES

As fontes vêm do site Fontshare. São 2 passos:

1. **`index.html`** → o `<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@...">` baixa as fontes. Pra trocar, pega o link de outra fonte no fontshare.com.
2. **`tailwind.config.js`** → diz onde cada uma é usada:
   ```js
   fontFamily: {
     display: ['"Cabinet Grotesk"', 'sans-serif'], // títulos e placares
     sans: ['"General Sans"', 'sans-serif'],       // todo o resto
   },
   ```
3. Detalhe: o `src/index.css` também menciona `'Cabinet Grotesk'` nas classes `.headline`, `.score-number` e `.flip-digit` — troca lá também.

---

## 5. Mudar EFEITOS e ANIMAÇÕES (`src/index.css`)

| Efeito | Classe | O que ajustar |
|---|---|---|
| Bolinha "AO VIVO" piscando | `.pulse-live` | `1.6s` = velocidade da piscada |
| Barra vermelha correndo no card ao vivo | `.live-bar` | `2.2s` = velocidade; `#EF4444` = cor |
| Folhinha do placar virando | `@keyframes flip-turn` | `0.5s` = duração da virada |
| Entrada suave dos cards | `animation: pop-in` (no `tailwind.config.js`) | `0.35s` = duração |
| Gradiente + grid do hero | `.jipd-hero` | as 3 cores do gradiente e o `28px` do grid |
| Brilho amarelo sob o placar | `.board-glow` | `rgba(245, 234, 21, 0.30)` — último número = intensidade |

**Quer deixar mais rápido/lento?** Muda os segundos. **Quer remover um efeito?** Apaga a classe do `className` no `.jsx` que a usa.

---

## 6. O PLACAR DE MESA (nosso xodó)

Três arquivos controlam ele:

| Arquivo | O que controla |
|---|---|
| `src/components/match/FlipScore.jsx` | **Tamanhos** dos cartões. Tem a tabela `sizes`: `sm` (cards de lista), `md`, `lg` (detalhe do jogo). Quer o placar maior/menor? Muda `w-12 h-14` e `text-2xl` do tamanho correspondente. |
| `src/components/match/ScoreBoard.jsx` | A **moldura completa** (abas, corpo, ×, argolas), usada no detalhe do jogo. |
| `src/index.css` | As **cores e formas**: `.flip-digit` (cor amarela `#F5EA15` do número), `.flip-panel` (preto do cartão), `.board-body` (corpo trapezoidal), `.board-glow` (brilho), `.board-ring` (argolas), `.board-tab` (abas). |

---

## 7. Mapa completo: "quero mudar X → mexo em Y"

### Estrutura geral
| Quero mudar... | Arquivo |
|---|---|
| Barra do topo (logo, megafone, indicador ao vivo) | `src/components/layout/TopBar.jsx` |
| Menu de baixo (abas, ícones, ordem) | `src/components/layout/BottomNav.jsx` |
| Tela de bloqueio pré-evento + contagem regressiva | `src/components/layout/EventGate.jsx` |
| Título + setinha de voltar das páginas | `src/components/layout/Header.jsx` |
| A setinha de voltar em si | `src/components/common/BackButton.jsx` |
| Todos os ícones do site (SVGs) | `src/components/common/Icons.jsx` |

### Peças reutilizáveis
| Quero mudar... | Arquivo |
|---|---|
| Todos os botões de uma vez | `src/components/common/Button.jsx` |
| Todas as "caixinhas brancas" | `src/components/common/Card.jsx` |
| Escudo das turmas (tamanho, borda, sigla) | `src/components/match/TeamCrest.jsx` |
| Card de jogo das listagens | `src/components/match/LiveScoreCard.jsx` |
| Etiqueta de status (AO VIVO, Agendado...) | `src/utils/constants.js` (textos e cores) |
| Spinner de carregando | `src/components/common/Loader.jsx` |

### Telas
| Tela | Arquivo |
|---|---|
| Home (hero BEM-VINDO, teaser do bolão, atalhos) | `src/pages/public/Home.jsx` |
| Placar ao vivo | `src/pages/public/LiveScores.jsx` |
| Detalhe do jogo (placar de mesa, bolão do jogo) | `src/pages/public/MatchDetail.jsx` |
| Horários | `src/pages/public/Schedule.jsx` |
| Ranking (pódio, tabela, chaveamento) | `src/pages/public/Standings.jsx` |
| Avisos | `src/pages/public/Announcements.jsx` |
| Bolão (abas, ranking dos cravadores) | `src/pages/public/Bolao.jsx` |
| Formulário de entrar no bolão | `src/components/bolao/ProfileSetup.jsx` |
| Widget de palpite + barra de torcida | `src/components/bolao/PalpiteWidget.jsx` |
| Pontos do bolão (5 pts exato / 2 pts vencedor) | `src/utils/bolao.js` |

### Onde acho um texto que quero trocar?
No VS Code: **Ctrl+Shift+F** (busca em todos os arquivos) → digita o texto que você viu na tela → ele mostra o arquivo exato.

---

## 8. Fluxo de trabalho seguro (sempre assim!)

```bash
# 1. Rodar o site local pra ver as mudanças ao vivo
npm run dev

# 2. Mexeu, salvou, gostou? Guarda no git:
git add .
git commit -m "design: descreve o que mudou"

# 3. Publicar pra todo mundo:
npm run build
firebase deploy --only hosting
```

**Deu ruim e quer desfazer?**
- Ainda não commitou: `git checkout -- caminho/do/arquivo.jsx` (volta o arquivo)
- Já commitou: `git revert HEAD` (desfaz o último commit com segurança)

**Regra de ouro:** uma mudança por vez, olha no navegador, commita. Assim nunca se perde.
