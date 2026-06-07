# Civilium — Visão Geral

## Objetivo

O Civilium automatiza a consulta de dados cadastrais de pessoas físicas no portal da Receita Federal do Brasil. A partir de uma planilha CSV (nome, CPF, data de nascimento), o sistema consulta o portal linha por linha, aguarda resolução manual do CAPTCHA e retorna **CONFERE** ou **NÃO CONFERE** para cada pessoa.

## Princípios de Produto

| ID | Princípio |
|----|-----------|
| P-001 | Linguagem do domínio na UI — nunca jargão técnico |
| P-002 | Mobile-first real — celular é a tela primária |
| P-003 | Auto-save; decisão única ao final: Exportar ou Descartar |
| P-004 | Filtragem proativa — mostrar só o elegível |
| P-005 | Validação no servidor — cliente é cosmético |
| P-006 | Estado na URL — F5 mantém contexto |
| P-007 | Soft delete e auditoria append-only |

## Personas

- **A-001** Advogado / Paralegal
- **A-002** Analista de RH
- **A-003** Correspondente Jurídico (persona crítica — condições adversas)
- **A-004** Contador / Auditor
- **A-005** Administrador do Sistema (fora do MVP)

## Decisões de Produto

| ID | Decisão |
|----|---------|
| DP-001 | Playwright integrado ao Next.js na Vercel (`@sparticuz/chromium`) com estado de sessão no Supabase |
| DP-002 | MVP sem autenticação (single-user) |
| DP-003 | Streaming do CAPTCHA via SSE com screenshot |
| DP-004 | Limite de 100 pessoas por lote |
| DP-005 | Schema sincronizado via `drizzle-kit push` (sem migrations) |

## Glossário

| Termo | Significado |
|-------|-------------|
| Planilha | CSV enviado pelo usuário |
| Pessoa | Linha da planilha |
| Consulta | Verificação no portal da Receita |
| Lote | Conjunto de pessoas de uma planilha |
| CONFERE | Nome informado = nome na Receita |
| NÃO CONFERE | Nomes diferentes |

### Termos proibidos na UI

`registro`, `entidade`, `submeter`, `validação`, `transação`, `scraping`, `bot`, `automation` e equivalentes técnicos.
