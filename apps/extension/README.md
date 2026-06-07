# Civilium Bridge — Extensão Chrome v2.3

Ponte entre o app Civilium e o portal da Receita Federal.

## Distribuição para a equipe

Na raiz do monorepo:

```bash
pnpm setup:secrets   # se config.js ainda não existir
pnpm pack:extension
```

Gera em `dist/`:

- `civilium-bridge-v{versão}.zip` — pacote pronto para instalar (inclui guias)
- `GUIA-INSTALACAO.md` — instruções em Markdown
- `GUIA-INSTALACAO.html` — guia visual; abra no Chrome → **Ctrl+P** → **Salvar como PDF**

Envie o ZIP e o guia (HTML, PDF ou Markdown) por canal seguro.

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

## Fluxo em lote (modo contínuo)

1. Usuário clica **Iniciar verificação em lote** no Civilium
2. Extensão abre **uma única aba** no portal da Receita
3. Usuário resolve o CAPTCHA para cada pessoa
4. Ao detectar o resultado, a extensão envia ao Civilium e **carrega automaticamente a próxima pessoa na mesma aba**
5. O processo se repete até o fim da lista
