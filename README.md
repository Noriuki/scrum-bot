<p align="center">
  <img src="assets/scrumbot-logo.png" alt="ScrumBot" width="120" />
</p>

<h1 align="center">ScrumBot</h1>

<p align="center">
  Bot de Discord para <strong>Planning Poker</strong> e cerimônias ágeis.
</p>

<p align="center">
  Sessões, user stories, votos ocultos e revelação — direto no seu servidor.
</p>

---

## O que é

Backend em **NestJS** que expõe um endpoint consumido pelo Discord. Sua equipe pode:

- **Criar sessões** de estimativa por canal
- **Adicionar user stories** e abrir votação com botões (points ou Fibonacci)
- **Revelar votos** com média e relatório
- **Encerrar sessões** com relatório geral

Possível evolução: daily standup, retrospectivas, ferramentas de sprint.

---

## Stack

| Camada   | Tecnologia                          |
| -------- | ----------------------------------- |
| Runtime  | Node.js 22                          |
| Framework| NestJS 11                           |
| Linguagem| TypeScript 5                        |
| Banco    | PostgreSQL (TypeORM)                |
| Validação| class-validator + ValidationPipe    |
| Qualidade| ESLint, Prettier, Husky, lint-staged|

---

## Estrutura

```
src/
├── main.ts
├── app.module.ts
├── common/                    # BaseEntity, constants, utils
├── integrations/discord/      # Interactions endpoint, handler, DiscordService
└── modules/
    ├── user/                  # usuários (discordId, nome)
    ├── session/               # sessões (título, status, voteScale)
    ├── story/                 # user stories por sessão
    └── vote/                  # votos (valor, revelação)
```

- **Domínio:** user, session, story, vote — services, entities, DTOs (sem controllers REST).
- **Discord:** `integrations/discord` — `POST /api/interactions`, handler de comandos/botões, `DiscordService` para a API do Discord.

---

## Pré-requisitos

- **Node.js** 22+
- **Yarn** (ou npm/pnpm)
- **Docker** e Docker Compose (PostgreSQL)

---

## Configuração

**1. Variáveis de ambiente**

```bash
cp .env.example .env
```

Configure no mínimo:

| Variável            | Uso |
| ------------------- | --- |
| `DATABASE_URL`      | Conexão PostgreSQL |
| `DISCORD_PUBLIC_KEY`| Chave pública do app (General Information) — valida o Interactions endpoint |
| `DISCORD_BOT_TOKEN` | Token do bot |
| `DISCORD_CLIENT_ID` | Para `yarn register-commands` |

Opcionais: `PORT`, `NODE_ENV`, `DISCORD_API_BASE`.

**2. Dependências**

```bash
yarn install
```

**3. Banco (Docker)**

```bash
docker compose up -d postgres
```

| Serviço    | Porta (host) | Credenciais      |
| ---------- | ------------- | ---------------- |
| PostgreSQL | 5433          | scrumbot / scrumbot |

Subir app + banco:

```bash
docker compose up -d
```

API em **http://localhost:3000**. Em dev o TypeORM usa `synchronize: true`.

---

## Comandos

| Comando          | Descrição              |
| ---------------- | ---------------------- |
| `yarn start`     | Build e execução       |
| `yarn start:dev` | Watch (reload)         |
| `yarn start:prod`| Produção               |
| `yarn build`     | Compila para `dist/`   |
| `yarn register-commands` | Registra `/planning-poker` no Discord (uma vez) |

---

## Testes

| Comando         | Descrição        |
| --------------- | ---------------- |
| `yarn test`     | Unit + e2e       |
| `yarn test:watch` | Watch mode     |
| `yarn test:cov` | Cobertura        |

- **Unit:** `test/unit/**/*.spec.ts`
- **E2E:** `test/e2e/**/*.spec.ts` (supertest). Interações Discord não exigem Postgres; outros testes podem exigir.

---

## Scripts

| Script        | Descrição              |
| ------------- | ---------------------- |
| `yarn lint`   | ESLint + fix           |
| `yarn format` | Prettier em `src` e `test` |
| `yarn prepare`| Husky (pre-commit: lint-staged) |

---

## API

Prefixo global: **`/api`**

| Método | Rota               | Descrição |
| ------ | ------------------ | --------- |
| GET    | `/api/health`      | Health check — `{ "status": "ok" }` (sem rate limit) |
| POST   | `/api/interactions`| Interações Discord (PING, comandos, botões). Headers: `X-Signature-Ed25519`, `X-Signature-Timestamp` |

**Rate limit:** 120 req/min por IP (`@nestjs/throttler`). `/api/health` com `@SkipThrottle()`.

Configurar a URL no Discord: **Interactions Endpoint URL** no painel do app. Ver [docs/DISCORD_WEBHOOK.md](docs/DISCORD_WEBHOOK.md) se existir.

---

## Uso no Discord

### Fluxo das sessões

1. **Uma sessão ativa por canal** — `/planning-poker start [título] [escala]`  
   Escala opcional: **points** (1–5, padrão) ou **fibonacci**.

2. **Várias stories na mesma sessão** — `/planning-poker story título:<texto>`  
   Cada story gera uma mensagem com botões de voto.  
   `/planning-poker reveal` revela os votos da **última** story (média + lista).

3. **Encerrar** — `/planning-poker end`  
   Envia **relatório** (todas as stories + média). Depois não é possível adicionar story nem revelar; use `start` para nova sessão no canal.

### Uso programático

Para enviar mensagens ou obter o bot no código, injete `DiscordService`:

```ts
constructor(private readonly discord: DiscordService) {}

await this.discord.sendChannelMessage(channelId, { content: "Hello" });
await this.discord.getBotUser();
```

---

## Licença

UNLICENSED (projeto privado).
