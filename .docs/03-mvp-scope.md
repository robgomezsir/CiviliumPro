# Escopo do MVP

## Incluído

- Upload de planilha CSV (máx. 100 pessoas)
- Criação de lote com consultas pendentes
- Loop de consulta com CAPTCHA manual via microserviço Playwright
- Progresso em tempo real (SSE)
- Pausar/retomar lote
- Painel de resultados com filtros em URL
- Exportação CSV
- Descartar lote com confirmação
- Dashboard mínimo com lotes recentes
- Soft delete e auditoria de eventos críticos

## Excluído (v2)

- Autenticação e multi-tenant
- Módulo de configurações/admin
- Armazenamento de CSV no Supabase Storage
- App mobile nativo
- Integrações pagas de consulta CPF

## Arquitetura MVP

- **App:** Next.js 16 na Vercel (frontend + Playwright serverless)
- **Banco:** Supabase PostgreSQL via Drizzle
