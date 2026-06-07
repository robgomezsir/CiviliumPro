# Civilium Bridge — Publicação na Chrome Web Store

## Pacote para upload

```bash
pnpm icons:extension
pnpm pack:store
```

Arquivo gerado: `dist/civilium-bridge-store-v{versão}.zip`

**Não inclui segredos.** Cada usuário configura a chave em **Opções da extensão**.

---

## Dados do listing

| Campo | Valor sugerido |
|-------|----------------|
| **Nome** | Civilium Bridge |
| **Resumo** | Ponte entre o Civilium e a Receita Federal para consultas cadastrais. |
| **Descrição** | Ver seção abaixo |
| **Categoria** | Produtividade |
| **Idioma** | Português (Brasil) |
| **URL do site** | https://civiliumpro.vercel.app |
| **Política de privacidade** | https://civiliumpro.vercel.app/privacidade-extensao |
| **Ícone da loja** | `icons/store-icon128.png` (128×128) |

### Descrição detalhada (PT)

```
Civilium Bridge conecta o aplicativo Civilium ao portal oficial da Receita Federal do Brasil.

Para quem é:
Profissionais que validam lotes de CPF em escritórios de advocacia, RH, contabilidade e áreas correlatas usando o Civilium.

O que faz:
• Detecta quando você inicia uma consulta no Civilium
• Abre o portal da Receita Federal na mesma aba (modo lote)
• Aguarda você resolver o CAPTCHA manualmente
• Envia o resultado de volta ao Civilium automaticamente
• Avança para a próxima pessoa da lista

O que NÃO faz:
• Não automatiza CAPTCHA
• Não coleta dados para publicidade
• Não acessa sites além do Civilium e da Receita Federal

Configuração:
Após instalar, abra as Opções da extensão e informe a URL do Civilium e a chave de integração fornecida pelo administrador da sua organização.

Suporte: https://civiliumpro.vercel.app
Privacidade: https://civiliumpro.vercel.app/privacidade-extensao
```

---

## Propósito único (Single purpose)

> Permitir que usuários do Civilium consultem dados cadastrais no portal da Receita Federal e devolvam o resultado ao aplicativo web, com resolução manual de CAPTCHA.

---

## Justificativa de permissões (para revisão)

| Permissão | Justificativa |
|-----------|---------------|
| `tabs` | Abrir e reutilizar a aba do portal da Receita durante consultas em lote |
| `storage` | Salvar configuração (URL + chave) e estado temporário da consulta |
| `civiliumpro.vercel.app` | Comunicação com o app Civilium via bridge segura |
| `servicos.receita.fazenda.gov.br` | Leitura do resultado após CAPTCHA manual do usuário |

---

## Checklist de conformidade

- [x] Manifest V3
- [x] Sem código remoto (todo JS empacotado)
- [x] Sem segredo embutido no pacote da loja
- [x] Página de privacidade pública
- [x] Permissões mínimas e justificadas
- [x] Ícones 16 / 32 / 48 / 128
- [x] Página de opções para configuração
- [ ] Capturas de tela 1280×800 (mín. 1) — adicionar manualmente
- [ ] Conta de desenvolvedor Chrome ($5 USD, única vez)
- [ ] Publicar como **Unlisted** se for uso interno da equipe

---

## Capturas sugeridas

1. Civilium com badge **Bridge ativa**
2. Página de **Opções** da extensão
3. Portal da Receita com consulta em andamento
4. Resultado retornando ao Civilium

Dimensão: **1280 × 800** ou **640 × 400** (PNG/JPEG).

---

## Distribuição interna vs loja

| Canal | Comando | Segredo |
|-------|---------|---------|
| Equipe (ZIP) | `pnpm pack:extension` | Embutido via `config.js` local |
| Chrome Web Store | `pnpm pack:store` | Usuário configura em Opções |
