# CAPTCHA — Arquitetura Vercel-only

## Modelo stateless (serverless)

Cada Server Action na Vercel:

1. Abre Chromium (`@sparticuz/chromium` em produção)
2. Restaura `storageState` do Supabase (`sessoes_automacao`)
3. Executa a ação (preencher, clicar, submeter)
4. Salva novo `storageState` e fecha o browser

## Modos de desafio

| Modo | Detecção | UI |
|------|----------|-----|
| `image` | `#imgCaptcha` visível | Imagem + campo de texto |
| `viewport` | hCaptcha / reCAPTCHA / genérico | Screenshot + cliques relay |

## Arquivos

- `apps/web/src/lib/automacao/sessao.ts` — orquestração
- `apps/web/src/lib/automacao/receita-adapter.ts` — portal Receita
- `apps/web/src/lib/automacao/browser.ts` — Chromium Vercel/local
- `apps/web/src/components/dominio/captcha-workspace.tsx` — UI

## Vercel

- `maxDuration: 60` em `vercel.json` e `lote/[loteId]/page.tsx`
- `serverExternalPackages`: `playwright-core`, `@sparticuz/chromium`
- `outputFileTracingIncludes` para `browsers.json`
