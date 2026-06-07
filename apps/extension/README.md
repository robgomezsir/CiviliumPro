# Civilium Bridge — Extensão Chrome v2.2

Ponte entre o app Civilium e o portal da Receita Federal.

## Instalação (desenvolvimento)

1. Abra `chrome://extensions`
2. Ative **Modo do desenvolvedor**
3. Clique em **Carregar sem compactação**
4. Selecione a pasta `apps/extension`

## Configuração

Copie `config.example.js` para `config.js` e defina o segredo:

```bash
cp config.example.js config.js
```

O `WEBHOOK_SECRET` deve ser o mesmo valor de `CIVILIUM_WEBHOOK_SECRET` na Vercel.
Ou execute na raiz do monorepo: `pnpm setup:secrets`

A extensão injeta `bridge.js` nas páginas do Civilium para comunicação segura com o service worker (sem expor o ID da extensão).

## Atualizar após mudanças

Em `chrome://extensions`, clique em **Recarregar** na extensão Civilium Bridge.

## Solução de problemas

- **Resultado não volta ao Civilium:** recarregue a extensão, confira se `WEBHOOK_SECRET` em `config.js` é igual ao `CIVILIUM_WEBHOOK_SECRET` na Vercel, e mantenha a aba da Receita aberta até aparecer o comprovante.
- **Consulta travada em "Em andamento":** clique em **Abrir portal novamente** ou recarregue a página do lote (expira após 5 minutos).

## Fluxo

1. Usuário clica **Abrir portal da Receita** no Civilium
2. Extensão abre nova aba no portal oficial
3. Usuário resolve o CAPTCHA manualmente
4. Content script detecta o resultado e envia para `/api/resultado-externo`
5. Civilium atualiza a consulta automaticamente
