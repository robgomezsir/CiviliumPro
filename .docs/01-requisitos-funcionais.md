# Requisitos Funcionais

## Módulo Upload e Lote

| RF | Descrição |
|----|-----------|
| RF-001 | Upload de planilha CSV com colunas `nome`, `cpf`, `data_nascimento` |
| RF-002 | Validação client + server antes de criar lote |
| RF-003 | Loop sequencial de consultas com CAPTCHA manual |
| RF-004 | Pausar e retomar lote na mesma sessão |
| RF-005 | Painel de progresso em tempo real |
| RF-006 | Comparativo CONFERE / NÃO CONFERE por pessoa |
| RF-007 | Exportação CSV do resultado final |
| RF-008 | Descartar lote (soft delete + auditoria) |

## Regras de Negócio

| ID | Regra |
|----|-------|
| RN-001 | Comparação de nomes case-insensitive, sem acentuação |
| RN-002 | CPF 11 dígitos; aceita formatado, armazena sem formatação |
| RN-003 | Data de nascimento obrigatória |
| RN-004 | Erro do portal → status `ERRO` com mensagem em linguagem do domínio |
| RN-005 | CAPTCHA manual a cada consulta — nunca automatizar |
| RN-006 | Loop pausável e retomável na mesma sessão |

## Padrões Arquiteturais

### P0 — Ciclo de Vida com Rascunho

Estados do lote: `AGUARDANDO` → `EM_CONSULTA` → `CONCLUIDO` | `DESCARTADO`

### P1 — Operações com Cascatas

Concluir/descartar lote + auditoria na mesma transação.

### P2 — Estado Calculado em Runtime

Status de consulta derivado dos campos de controle.

### P3 — Telas Analíticas

Painel de resultados read-only, cache ≤ 1 min.
