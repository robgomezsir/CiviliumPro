# Civilium

Plataforma para verificação cadastral em lote no portal da Receita Federal do Brasil.

## Estrutura

- `apps/web` — Next.js 16 (frontend + Playwright via `@sparticuz/chromium` na Vercel)
- `packages/shared` — schemas Zod e utilitários compartilhados
- `services/automacao-receita` — legado local (opcional; automação roda no próprio Next.js)

## Desenvolvimento local

```bash
pnpm install
cp apps/web/.env.local.example apps/web/.env.local
```

Configure `DATABASE_URL` e `DIRECT_URL` com seu projeto Supabase.

```bash
pnpm db:push
pnpm dev
```

Para testar sem o portal real, use `RECEITA_MOCK=true` em `apps/web/.env.local`. O CAPTCHA mock é `ABC123`.

## Deploy

- **App:** Vercel (`apps/web`) — web + automação Playwright na mesma aplicação
- **Banco:** Supabase + `pnpm db:push`

### Variáveis na Vercel

- `DATABASE_URL` (pooler porta 6543)
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RECEITA_MOCK=false` (produção)
