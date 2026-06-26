# Interclasse ETE Porto Digital

Plataforma web para acompanhar placares ao vivo, horários, ranking e chaveamento do interclasse — com área administrativa para juízes/organizadores atualizarem tudo em tempo real.

**Stack:** React + Vite + Tailwind + Firebase (Firestore, Auth, Hosting)

---

## 1. Instalar e rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Sem as variáveis do Firebase configuradas (passo 2), o app abre mas as telas ficam vazias/erram ao tentar ler dados — isso é esperado até você conectar o projeto.

## 2. Criar e conectar o projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) → **Criar projeto**.
2. No menu lateral, ative:
   - **Firestore Database** → criar banco em modo produção.
   - **Authentication** → aba "Sign-in method" → ativar **E-mail/senha**.
   - **Hosting** → "Começar".
3. Em "Configurações do projeto" → role até "Seus apps" → **Adicionar app (Web)**. Copie o objeto `firebaseConfig`.
4. Copie `.env.example` para `.env` e cole os valores correspondentes:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Rode `npm run dev` novamente para carregar as novas variáveis.

## 3. Publicar as regras de segurança

```bash
npm install -g firebase-tools   # se ainda não tiver
firebase login
firebase init                   # selecione Firestore + Hosting, "usar arquivos existentes" quando perguntar
firebase deploy --only firestore:rules
```

O arquivo `firestore.rules` já está pronto: leitura pública liberada, escrita restrita a quem estiver na coleção `admins`.

## 4. Criar o primeiro usuário administrador

A escrita na coleção `admins` é bloqueada pelo próprio app (de propósito — só dá pra criar pelo console, nunca pelo client). Passo a passo:

1. Firebase Console → **Authentication** → **Users** → **Add user** → preencha e-mail e senha do primeiro admin.
2. Copie o **UID** gerado para esse usuário.
3. Firebase Console → **Firestore Database** → **Iniciar coleção** → ID da coleção: `admins`.
4. ID do documento: **cole o UID copiado**. Campos do documento:
   - `name` (string): nome do admin
   - `role` (string): `"superadmin"`
5. Salvar. Esse usuário já pode logar em `/admin/login`.

Repita os passos 1–4 para cada juiz/organizador que vai operar o sistema.

## 5. Cadastrar os dados do interclasse

Depois de logar em `/admin`:

1. **Turmas/Modalidades** (`/admin/cadastro`) — cadastre todas as turmas (com cor de identidade) e as modalidades (futsal, vôlei, etc.).
2. **Jogos** (`/admin/jogos`) — cadastre os confrontos com data/hora, local, fase e turmas.
3. Durante o evento, abra **Placar** em cada jogo (`/admin/jogos/:id/placar`) para atualizar o placar em tempo real, mudar status e postar avisos rápidos.
4. **Ranking** (`/admin/ranking`) — atualize pontos/V/E/D de cada turma ao final de cada rodada.

Tudo isso já aparece automaticamente no site público (`/`, `/placar`, `/horarios`, `/ranking`) — não precisa de nenhum passo extra de "publicar".

## 6. Build e deploy em produção

```bash
npm run build
firebase deploy --only hosting
```

O Firebase te dá uma URL pública (`seu-projeto.web.app`) — é esse link que você compartilha com a escola.

## 7. Avisos importantes

- Se o Firestore reclamar de **índice ausente** no console do navegador (geralmente na tela de Avisos), o próprio erro traz um link "Create Index" — clique nele e aguarde alguns minutos.
- O ranking é atualizado **manualmente** pelo admin no MVP (decisão deliberada, ver documento de arquitetura). Migrar para cálculo automático via Cloud Function é uma melhoria de pós-evento.
- O chaveamento é só uma visualização dos jogos com `phase` diferente de `"grupos"` — não existe coleção separada de chaveamento para manter.

## 8. Próximos passos sugeridos (pós-MVP)

- PWA (manifest + service worker) para instalar na tela inicial do celular
- Notificações push via Firebase Cloud Messaging
- Cálculo automático de ranking via Cloud Function
- Histórico completo de partidas finalizadas
- Botão de torcida (`cheerCountA`/`cheerCountB` já estão no esquema, faltando UI)
