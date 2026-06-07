# Configuração Supabase — Civilium

## Status do MCP

| Item | Status |
|------|--------|
| MCP no Cursor (`~/.cursor/mcp.json`) | Configurado |
| Project ref | `xfoizpniywllpgyycska` |
| Modo MCP | `read_only=true` |
| Autenticação OAuth | **Pendente** — aprovar no popup do Cursor |

Ferramentas disponíveis após autenticar: `list_tables`, `execute_sql`, `get_project_url`, `generate_typescript_types`, etc.

## Variáveis configuradas em `apps/web/.env.local`

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` / `DIRECT_URL` — **ainda requerem a senha do banco**

## Passos para concluir

### Opção A — Via MCP (recomendado)

1. No Cursor, quando solicitado, **aprove** a autenticação do servidor `supabase`
2. Peça ao agente: "liste as tabelas do Supabase" para validar conexão
3. Substitua `[SUA-SENHA]` em `apps/web/.env.local` (senha em *Settings → Database*)
4. Execute: `pnpm db:push`

### Opção B — Manual

1. Abra https://supabase.com/dashboard/project/xfoizpniywllpgyycska/settings/database
2. Copie as connection strings:
   - **Transaction pooler** (porta 6543) → `DATABASE_URL`
   - **Direct connection** (porta 5432) → `DIRECT_URL`
3. Cole em `apps/web/.env.local`
4. Execute: `./scripts/setup-supabase.ps1`

### Opção C — SQL Editor (sem senha no terminal)

1. Abra https://supabase.com/dashboard/project/xfoizpniywllpgyycska/sql/new
2. Cole o conteúdo de `supabase/migrations/0001_initial_civilium.sql`
3. Execute o script
4. Ainda assim, configure `DATABASE_URL` e `DIRECT_URL` em `.env.local` para o app Next.js conectar ao Postgres

## Schema esperado

Após `drizzle-kit push`:

- `lotes` — enum `status_lote`
- `consultas` — enum `status_consulta`
- `auditoria_eventos` — log append-only

## CLI Supabase

```bash
npx supabase login
npx supabase link --project-ref xfoizpniywllpgyycska
```
