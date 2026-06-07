# Requisitos Não Funcionais

| ID | Requisito | Critério |
|----|-----------|----------|
| RNF-001 | Performance dashboard | TTI ≤ 2s em 4G |
| RNF-002 | Streaming progresso | SSE com debounce 500ms |
| RNF-003 | Tabela grandes | Paginação/virtualização para lotes > 100 |
| RNF-004 | Busca | Debounce 300ms |
| RNF-005 | Rate limiting | Em iniciar-lote e rotas de sessão |
| RNF-006 | Privacidade CPF | Nunca em logs ou erros visíveis |
| RNF-007 | Acessibilidade contraste | ≥ 7:1 em fluxos de campo |
| RNF-008 | Acessibilidade toque | Botões primários ≥ 56×56 dp |
| RNF-009 | Acessibilidade ícones | Ícone + texto em ações primárias |
| RNF-010 | Verificação de tipos | `npx tsc --noEmit` em CI |
