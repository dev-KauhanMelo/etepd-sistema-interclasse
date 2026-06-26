# Guia do Código — Interclasse ETE Porto Digital

Esse documento explica o que cada arquivo do projeto faz. A ideia é você conseguir abrir qualquer arquivo, saber pra que ele serve, e saber se é ali que você mexe quando quiser **corrigir um bug** ou **mudar o visual**.

> 🎨 = bom lugar pra mexer no design
> 🐛 = bom lugar pra procurar quando der bug
> 🔌 = conecta com o Firebase

---

## 1. Configuração (raiz do projeto)

Esses arquivos não têm "tela" — são regras de como o projeto se comporta.

| Arquivo | O que faz |
|---|---|
| `package.json` | Lista de pacotes que o projeto usa (React, Firebase, etc.) e os comandos (`npm run dev`, `npm run build`). Se quiser adicionar uma biblioteca nova, ela aparece aqui depois do `npm install nome-da-lib`. |
| `vite.config.js` | Configuração do Vite (a ferramenta que builda/roda o projeto). Raramente precisa tocar. |
| `postcss.config.js` | Faz o Tailwind funcionar. Não precisa tocar. |
| `tailwind.config.js` | 🎨 **Esse você vai abrir bastante pro design.** Define a paleta de cores (`brand`, `live`, `scheduled`, `finished`) e as fontes (`display`, `sans`). Mudar a cor principal do site = mudar uma linha aqui, e ela atualiza em **todo** o site de uma vez. |
| `index.html` | A página HTML base. Tem o `<title>` da aba do navegador e o link das fontes do Google Fonts. Se quiser trocar a fonte, é aqui que troca o link, além do `tailwind.config.js`. |
| `.env` | 🔌 Suas chaves do Firebase (a config que você copiou do console). **Nunca sobe pro GitHub** (o `.gitignore` impede isso). |
| `.env.example` | Igual ao `.env`, mas sem os valores — só mostra quais variáveis existem. Esse pode subir pro GitHub. |
| `.gitignore` | Lista de arquivos/pastas que o Git ignora (`node_modules`, `.env`, `dist`). |
| `firebase.json` | Diz pro Firebase CLI onde fica a pasta de build (`dist`) e onde estão as regras do Firestore. |
| `firestore.rules` | 🔌🐛 **As regras de segurança do banco.** Se um dia algo "não deixar salvar" ou der erro de `permission-denied`, o problema quase sempre está aqui ou em como o admin foi cadastrado. |
| `firestore.indexes.json` | Índices do Firestore (deixa vazio por enquanto; o próprio Firebase avisa quando precisar criar um). |

---

## 2. Porta de entrada (`src/`)

| Arquivo | O que faz |
|---|---|
| `src/main.jsx` | O primeiro arquivo que roda. Pega o `<div id="root">` do `index.html` e manda o React desenhar o `App` dentro dele. Não precisa tocar. |
| `src/App.jsx` | Envolve o site com duas coisas: `BrowserRouter` (deixa usar URLs/páginas) e `AuthProvider` (deixa qualquer componente saber se tem alguém logado). Depois chama `AppRoutes`, que decide qual página mostrar. |
| `src/index.css` | 🎨 Estilo global. Tem a animação de "pulso" do indicador "AO VIVO" e a classe `.score-number` (a fonte grande e em negrito usada nos placares). Se quiser mudar como o número do placar se comporta visualmente, é aqui. |

---

## 3. Conexão com o Firebase

| Arquivo | O que faz |
|---|---|
| `src/services/firebase.js` | 🔌 Lê as chaves do `.env` e inicializa a conexão com o Firebase. Exporta `db` (Firestore) e `auth` (autenticação) — **todo** outro arquivo que fala com o Firebase importa esses dois daqui. Se o `.env` estiver errado, o erro nasce (mas geralmente aparece) em outro arquivo que usa esse. |

---

## 4. Services — funções que **escrevem** no banco

Pensa nos services como "ações": criar, atualizar, apagar. Eles não mostram nada na tela, só fazem a ação acontecer no Firebase.

| Arquivo | O que faz |
|---|---|
| `src/services/matchesService.js` | 🔌🐛 O mais importante. `createMatch` (cria jogo novo), `updateMatch` (atualiza qualquer campo), `deleteMatch`, `adjustScore` (soma/subtrai do placar), `addMatchNote` (adiciona aviso rápido). Se o placar não estiver salvando, o bug está aqui ou na tela que chama essas funções. |
| `src/services/standingsService.js` | `upsertStanding` — cria ou atualiza a linha de classificação de uma turma numa modalidade. |
| `src/services/announcementsService.js` | Criar, desativar e apagar avisos. |
| `src/services/classesService.js` | Criar turma nova. |
| `src/services/modalitiesService.js` | Criar modalidade nova. |

---

## 5. Hooks — funções que **leem** o banco em tempo real

Hooks são a "mágica" do tempo real: eles ficam **escutando** o Firestore (com `onSnapshot`), e toda vez que algo muda no banco, a tela atualiza sozinha, sem precisar recarregar a página.

| Arquivo | O que faz |
|---|---|
| `src/hooks/useMatches.js` | Devolve a lista de **todos** os jogos, sempre atualizada. |
| `src/hooks/useMatch.js` | Devolve **um** jogo específico (usado na tela de detalhe e na tela de atualizar placar). |
| `src/hooks/useClasses.js` | Lista de turmas. |
| `src/hooks/useModalities.js` | Lista de modalidades. |
| `src/hooks/useStandings.js` | Classificação de uma modalidade específica, já ordenada por pontos. |
| `src/hooks/useAnnouncements.js` | Lista de avisos ativos. |

🐛 Se uma tela fica "carregando" pra sempre ou não atualiza, o problema costuma estar no hook (consulta errada) ou nas regras do Firestore — não na página em si.

---

## 6. Autenticação e Rotas

| Arquivo | O que faz |
|---|---|
| `src/context/AuthContext.jsx` | 🔌 Sabe quem está logado (`user`) e se essa pessoa é admin (`isAdmin`, checando a coleção `admins`). Disponibiliza `login()` e `logout()` pra qualquer tela usar. |
| `src/routes/ProtectedRoute.jsx` | 🐛 O "segurança da porta". Antes de mostrar qualquer página `/admin/*`, checa se tem usuário logado E se ele é admin. Se não for, manda pra tela de login. |
| `src/routes/AppRoutes.jsx` | A lista de **todas** as rotas do site (qual URL mostra qual página). Se quiser criar uma página nova, é aqui que você registra a URL dela. |

---

## 7. Componentes — as peças visuais reutilizáveis

### `src/components/common/` — peças genéricas, usadas em quase tudo

| Arquivo | O que faz | 🎨 Design |
|---|---|---|
| `Button.jsx` | Botão padrão do site. Tem variações: `primary` (cor principal), `secondary` (cinza), `danger` (vermelho), `ghost` (transparente). | Mude as classes dentro de `variants` pra mudar a aparência de **todos** os botões do site de uma vez. |
| `Card.jsx` | A "caixinha branca com sombra" usada em quase toda tela. | Mude o `rounded-2xl`, `shadow-sm`, `border` aqui pra afetar todos os cards. |
| `Badge.jsx` | Etiqueta pequena e arredondada (usada pro status do jogo: "AO VIVO", "Agendado", etc.). | |
| `Loader.jsx` | O "girando" de carregando. | |
| `EmptyState.jsx` | Mensagem de "nada aqui ainda" (em vez de tela em branco). | |

### `src/components/layout/` — estrutura das páginas

| Arquivo | O que faz |
|---|---|
| `Header.jsx` | Cabeçalho com título e subtítulo, usado no topo das páginas públicas. |
| `BottomNav.jsx` | 🎨 A barra de navegação fixa no rodapé (Início, Placar, Horários, Ranking). Pra adicionar um 5º item de menu, é aqui. |
| `PublicLayout.jsx` | O "molde" das páginas públicas: mostra a página + a `BottomNav` sempre embaixo. |
| `AdminLayout.jsx` | O "molde" das páginas admin: cabeçalho escuro + menu de navegação + botão sair. |

### `src/components/match/` — tudo relacionado a partidas

| Arquivo | O que faz |
|---|---|
| `MatchStatusBadge.jsx` | A etiqueta colorida de status (usa as cores definidas em `utils/constants.js`). |
| `LiveScoreCard.jsx` | 🎨 **O card de placar que aparece em várias telas** (Início, Placar, Horários). Esse é o "elemento de assinatura visual" do site — se for redesenhar algo primeiro, comece por aqui, porque o impacto se repete em todo lugar. |

### `src/components/admin/`

| Arquivo | O que faz |
|---|---|
| `MatchForm.jsx` | O formulário de criar/editar jogo (modalidade, turmas, fase, local, data). Usado dentro de `ManageMatches.jsx`. |

---

## 8. Utils — funçõezinhas auxiliares

| Arquivo | O que faz |
|---|---|
| `utils/constants.js` | 🎨 `MATCH_STATUS` (texto e cor de cada status) e `PHASE_LABELS` (nomes das fases: "Oitavas de Final", etc.). Editar os nomes ou cores dos status é aqui. |
| `utils/formatDate.js` | Funções que transformam a data do Firebase em texto legível (`formatDateTime`, `formatTime`, `isToday`). |
| `utils/cn.js` | Função pequenininha que junta classes do Tailwind. Detalhe técnico, não precisa tocar. |

---

## 9. Páginas públicas (`src/pages/public/`)

Cada uma corresponde a uma URL que qualquer pessoa pode acessar.

| Arquivo | URL | O que mostra |
|---|---|---|
| `Home.jsx` | `/` | Resumo: jogo ao vivo, próximo jogo, último aviso. |
| `LiveScores.jsx` | `/placar` | Lista de jogos ao vivo + jogos de hoje. |
| `MatchDetail.jsx` | `/placar/:id` | Detalhe de um jogo específico (placar grande, avisos da partida). |
| `Schedule.jsx` | `/horarios` | Cronograma completo, com filtro por modalidade. |
| `Standings.jsx` | `/ranking` | Abas de Classificação e Chaveamento. |
| `Announcements.jsx` | `/avisos` | Feed de avisos. |

---

## 10. Páginas administrativas (`src/pages/admin/`)

| Arquivo | URL | O que faz |
|---|---|---|
| `Login.jsx` | `/admin/login` | Tela de login. |
| `Dashboard.jsx` | `/admin` | Painel: jogos de hoje, atalhos rápidos. |
| `ManageMatches.jsx` | `/admin/jogos` | Lista de jogos + abre o `MatchForm` pra criar/editar. |
| `UpdateScore.jsx` | `/admin/jogos/:id/placar` | A tela de atualizar placar durante o jogo (botões +/-, mudar status, postar aviso). |
| `ManageAnnouncements.jsx` | `/admin/avisos` | Criar e remover avisos. |
| `ManageStandings.jsx` | `/admin/ranking` | Editar pontos/V/E/D de cada turma. |
| `ManageClasses.jsx` | `/admin/cadastro` | Cadastrar turmas e modalidades. |

---

## 11. Checklist rápido — "eu quero mudar X, onde eu mexo?"

| Eu quero... | Eu vou em... |
|---|---|
| Mudar a cor principal do site | `tailwind.config.js` (campo `brand`) |
| Mudar a fonte | `tailwind.config.js` + `index.html` (link do Google Fonts) |
| Mudar a aparência do card de placar | `components/match/LiveScoreCard.jsx` |
| Mudar a aparência de todos os botões | `components/common/Button.jsx` |
| Adicionar um campo novo no jogo (ex.: nome do árbitro) | `matchesService.js` (no `createMatch`) + `MatchForm.jsx` (campo no formulário) + onde quiser exibir (`MatchDetail.jsx`, etc.) |
| Mudar quem pode editar o quê | `firestore.rules` |
| Mudar o texto/cor de um status | `utils/constants.js` |
| Adicionar uma página nova | Criar o arquivo em `pages/`, registrar a rota em `routes/AppRoutes.jsx` |
| Resolver "permission-denied" | `firestore.rules` (e se publicou: `firebase deploy --only firestore:rules`) |
| Resolver tela que não atualiza | O hook correspondente (`hooks/`) |

---

Se em algum momento der um erro que você não entender, me manda a mensagem de erro completa (print ou texto) junto com o nome do arquivo que você estava editando — eu sigo te ajudando a debugar daqui.
