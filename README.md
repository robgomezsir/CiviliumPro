# Civilium

Plataforma para verificação cadastral em lote no portal da Receita Federal do Brasil.

## Estrutura

- `apps/web` — Next.js 16 (frontend + API)
- `services/automacao-receita` — microserviço Playwright (Railway)
- `packages/shared` — schemas Zod e utilitários compartilhados

## Desenvolvimento local

```bash
pnpm install
cp .env.example apps/web/.env.local
cp .env.example services/automacao-receita/.env
```

### Supabase (projeto vinculado no MCP)

- **Project ref:** `xfoizpniywllpgyycska`
- **MCP Cursor:** configurado em `~/.cursor/mcp.json` (requer autenticação OAuth)
- **Dashboard:** https://supabase.com/dashboard/project/xfoizpniywllpgyycska

1. Aprove a autenticação do MCP **Supabase** no Cursor (popup OAuth), ou
2. Copie a senha do banco em *Settings → Database* e substitua `[SUA-SENHA]` em `apps/web/.env.local`

```bash
pnpm db:push
# ou
./scripts/setup-supabase.ps1
pnpm dev:automacao
pnpm dev
```

Para testar sem o portal real, use `RECEITA_MOCK=true` no serviço de automação. O CAPTCHA mock é `ABC123`.

## Deploy

- **Web:** Vercel (`apps/web`)
- **Automação:** Railway (`services/automacao-receita`)
- **Banco:** Supabase + `pnpm db:push`
