# Civilium Bridge — Extensão Chrome v3.0

Ponte entre o app Civilium e o portal da Receita Federal.

## Identidade visual

Ícones gerados a partir de `Civilium.ico` na raiz do monorepo:

```bash
pnpm icons:extension
```

Arquivos em `icons/icon{16,32,48,128}.png`.

## Distribuição interna (equipe)

```bash
pnpm setup:secrets   # cria config.js local (gitignored)
pnpm pack:extension
```

Gera `dist/civilium-bridge-v{versão}.zip` com segredo embutido para instalação em modo desenvolvedor.

## Chrome Web Store

```bash
pnpm icons:extension
pnpm pack:store
```

Gera `dist/civilium-bridge-store-v{versão}.zip` **sem segredos**.

Instruções completas de listing, privacidade e revisão: **`CHROME_WEB_STORE.md`**.

Política de privacidade: https://civiliumpro.vercel.app/privacidade-extensao

## Configuração (loja / primeira instalação)

1. Instale a extensão
2. Abra **Opções** (clique no ícone da extensão ou em `chrome://extensions` → Detalhes → Opções)
3. Informe a URL do Civilium e a **chave de integração** (`CIVILIUM_WEBHOOK_SECRET`)

## Instalação em desenvolvimento

1. `chrome://extensions` → Modo do desenvolvedor
2. **Carregar sem compactação** → pasta `apps/extension` ou ZIP do `pack:extension`
3. Configure em Opções se não usar o pacote com segredo embutido

## Solução de problemas

- **Extensão não detectada:** recarregue extensão e aba do Civilium; confirme URL `https://civiliumpro.vercel.app`
- **Bridge inativa / config_ausente:** abra Opções e salve URL + chave de integração
- **Erros em bridge.js:** recarregue extensão; verifique service worker ativo
- **Resultado não volta:** confira chave em Opções = `CIVILIUM_WEBHOOK_SECRET` na Vercel

## Fluxo em lote

1. **Iniciar verificação em lote** no Civilium
2. Uma aba da Receita para todo o lote
3. CAPTCHA manual por pessoa
4. Resultado volta ao Civilium; próxima pessoa na mesma aba
