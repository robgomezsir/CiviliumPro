# civilium bridge — Extensão Chrome v3.0.1

Ponte entre o app **civilium** e o portal da Receita Federal.

## Identidade visual

```bash
pnpm brand:assets
```

Gera ícones (`icons/icon{16,32,48,128}.png`), favicons web e copia `civilium-logo.png`.

## Distribuição interna (equipe)

```bash
pnpm setup:secrets   # cria config.js local (gitignored)
pnpm pack:extension
```

Gera em `dist/`:

- `civilium-bridge-v{versão}.zip` — pacote com chave embutida
- `GUIA-INSTALACAO.md` / `.html` — instruções para a equipe

## Chrome Web Store

```bash
pnpm brand:assets
pnpm pack:store
```

Gera `dist/civilium-bridge-store-v{versão}.zip` **sem segredos**.

Listing completo: **`CHROME_WEB_STORE.md`**

Privacidade: https://civiliumpro.vercel.app/privacidade-extensao

## Configuração

| Pacote | Como configurar |
|--------|-----------------|
| ZIP interno | Automático (chave embutida) |
| Chrome Web Store | **Opções** → URL + chave de integração |

## Instalação (modo desenvolvedor)

1. `chrome://extensions` → **Modo do desenvolvedor**
2. **Carregar sem compactação** → pasta do ZIP ou `apps/extension`
3. Confirme badge **Bridge ativa** em https://civiliumpro.vercel.app

## Fluxo no civilium

1. **Nova pesquisa** → cole Excel ou importe CSV
2. **Iniciar verificação** → abre portal da Receita
3. CAPTCHA manual → resultado volta ao civilium
4. Próxima pessoa na mesma aba (modo lote)

## Solução de problemas

- **Extensão não detectada:** recarregue extensão + aba do civilium
- **config_ausente:** Opções → URL `https://civiliumpro.vercel.app` + chave
- **Resultado não volta:** recarregue extensão; mantenha aba da Receita aberta
- **bridge.js:** verifique service worker em `chrome://extensions`
