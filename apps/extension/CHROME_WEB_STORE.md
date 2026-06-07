# civilium bridge — Publicação na Chrome Web Store

## Pacote para upload

```bash
pnpm brand:assets
pnpm pack:store
```

Arquivo: `dist/civilium-bridge-store-v{versão}.zip`

**Sem segredos.** Cada usuário configura em **Opções da extensão**.

---

## Dados do listing

| Campo | Valor |
|-------|-------|
| **Nome** | civilium bridge |
| **Resumo** | Ponte entre o civilium e a Receita Federal para consultas cadastrais. |
| **Categoria** | Produtividade |
| **Idioma** | Português (Brasil) |
| **URL do site** | https://civiliumpro.vercel.app |
| **Privacidade** | https://civiliumpro.vercel.app/privacidade-extensao |
| **Ícone** | `icons/store-icon128.png` |

### Descrição (PT)

```
civilium bridge conecta o aplicativo civilium ao portal oficial da Receita Federal do Brasil.

Para quem é:
Profissionais que validam CPFs em lote — advocacia, RH, contabilidade e áreas correlatas.

O que faz:
• Detecta quando você inicia uma pesquisa no civilium
• Abre o portal da Receita na mesma aba (modo lote)
• Aguarda resolução manual do CAPTCHA
• Envia o resultado de volta ao civilium automaticamente
• Avança para a próxima pessoa da lista

O que NÃO faz:
• Não automatiza CAPTCHA
• Não exibe anúncios nem rastreia navegação
• Não acessa sites além do civilium e da Receita Federal

Configuração:
Após instalar, abra Opções da extensão e informe a URL do civilium
(https://civiliumpro.vercel.app) e a chave de integração do administrador.

Suporte: https://civiliumpro.vercel.app
Privacidade: https://civiliumpro.vercel.app/privacidade-extensao
```

---

## Propósito único

> Permitir consultas cadastrais no portal da Receita Federal a partir do civilium, com CAPTCHA manual, devolvendo o resultado ao aplicativo web.

---

## Permissões

| Permissão | Justificativa |
|-----------|---------------|
| `tabs` | Abrir e reutilizar aba da Receita em consultas em lote |
| `storage` | Salvar configuração (URL + chave) e estado da consulta |
| `civiliumpro.vercel.app` | Bridge segura com o app civilium |
| `servicos.receita.fazenda.gov.br` | Leitura do resultado após CAPTCHA |

---

## Checklist

- [x] Manifest V3
- [x] Código empacotado (sem remoto)
- [x] Sem segredo no pacote da loja
- [x] Política de privacidade pública
- [x] Permissões mínimas
- [x] Ícones 16 / 32 / 48 / 128 + logo
- [x] Página de opções
- [ ] Screenshots 1280×800
- [ ] Conta desenvolvedor Chrome ($5 USD)
- [ ] Publicar como **Unlisted** (uso interno)

---

## Screenshots sugeridas

1. civilium com badge **Bridge ativa**
2. Tela **Nova pesquisa** com tabela colável do Excel
3. Página de **Opções** da extensão
4. Portal da Receita com consulta em andamento
5. Resultado no **Painel**

Dimensão: **1280 × 800** (PNG/JPEG).

---

## Distribuição

| Canal | Comando | Configuração |
|-------|---------|--------------|
| Equipe | `pnpm pack:extension` | Chave embutida |
| Loja | `pnpm pack:store` | Opções da extensão |
