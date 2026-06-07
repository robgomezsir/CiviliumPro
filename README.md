# Civilium v2.2

Plataforma para verificação cadastral em lote no portal da Receita Federal do Brasil.

## Arquitetura

```
Civilium Web → Extensão Chrome → Portal Receita → Webhook → Supabase
```

- Sem Puppeteer/Playwright no servidor — compatível com Vercel Hobby
- CAPTCHA resolvido manualmente pelo usuário na aba real da Receita
- Extensão **Civilium Bridge** envia o resultado via `/api/resultado-externo`

## Estrutura

- `apps/web` — Next.js 16 (UI + API + Supabase)
- `apps/extension` — Extensão Chrome Manifest V3 (Civilium Bridge)
- `packages/shared` — schemas Zod, tipos e utilitários compartilhados

## Desenvolvimento local

```bash
pnpm install
```

Configure `apps/web/.env.local` (veja `.env.example` na raiz).

```bash
pnpm setup:secrets   # gera CIVILIUM_WEBHOOK_SECRET + CRON_SECRET (local + extensão)
pnpm db:push
pnpm dev
```

### Extensão Chrome

1. Edite `apps/extension/config.js` com `API_BASE` e `WEBHOOK_SECRET`
2. Carregue em `chrome://extensions` → **Carregar sem compactação** → pasta `apps/extension`
## Deploy (Vercel)

1. Conecte o repositório (`Root Directory: apps/web`)
2. Configure as variáveis:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Pooler Supabase (IPv4) |
| `DIRECT_URL` | Conexão direta (migrations locais) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role |
| `CIVILIUM_WEBHOOK_SECRET` | Segredo do webhook (igual ao `config.js` da extensão) |
| `CRON_SECRET` | Autenticação do cron de expiração |
3. Consultas inativas expiram automaticamente ao carregar o lote (plano Hobby não suporta cron frequente na Vercel). Opcional: agende `GET /api/expirar-consultas` via [cron-job.org](https://cron-job.org) com header `Authorization: Bearer CRON_SECRET`

## Fluxo de consulta

1. Usuário importa CSV e inicia o lote
2. Para cada pessoa, clica **Abrir portal da Receita**
3. Extensão abre nova aba no portal oficial (CPF e data pré-preenchidos)
4. Usuário resolve o CAPTCHA manualmente
5. Content script detecta o resultado e envia ao webhook
6. Civilium atualiza a consulta e o progresso do lote automaticamente
