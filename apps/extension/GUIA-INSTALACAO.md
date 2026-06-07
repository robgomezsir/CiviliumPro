# civilium bridge — Guia de instalação

Extensão Chrome que conecta o **civilium** ao portal da Receita Federal para consultas cadastrais em lote.

**Versão:** {{VERSION}}  
**Site:** https://civiliumpro.vercel.app

---

## Antes de começar

| Requisito | Detalhe |
|-----------|---------|
| Navegador | Google Chrome (versão recente) |
| Arquivo recebido | `{{ZIP_NAME}}` (enviado pelo administrador) |
| Permissão | Modo do desenvolvedor no Chrome (passo a passo abaixo) |

### Tipos de pacote

| Pacote | Configuração |
|--------|----------------|
| **ZIP interno** (`pack:extension`) | Já vem com chave embutida — pronto para usar |
| **Chrome Web Store** (`pack:store`) | Configure em **Opções da extensão** na primeira instalação |

> Não altere os arquivos da extensão manualmente.

---

## Instalação passo a passo

### 1. Extrair o ZIP

1. Salve o arquivo `{{ZIP_NAME}}` em uma pasta fixa, por exemplo:
   - Windows: `C:\civilium\{{FOLDER_NAME}}`
   - Mac: `~/civilium/{{FOLDER_NAME}}`
2. Clique com o botão direito no ZIP e escolha **Extrair tudo**.
3. Confirme que a pasta contém `manifest.json`, `background.js` e a pasta `icons/`.

### 2. Abrir extensões do Chrome

Na barra de endereço, digite e pressione Enter:

```
chrome://extensions
```

### 3. Ativar o Modo do desenvolvedor

No canto superior direito, ative a chave **Modo do desenvolvedor**.

### 4. Carregar a extensão

1. Clique em **Carregar sem compactação**.
2. Selecione a pasta extraída (`{{FOLDER_NAME}}`).
3. Confirme que aparece **civilium bridge** na lista, versão **{{VERSION}}**.

### 5. Configurar conexão (somente pacote da Chrome Web Store)

Se o pacote **não** veio pré-configurado:

1. Clique no ícone **civilium bridge** na barra do Chrome (ou em Detalhes → Opções)
2. URL do civilium: `https://civiliumpro.vercel.app`
3. Cole a **chave de integração** fornecida pelo administrador
4. Clique em **Salvar configuração**

### 6. Fixar a extensão (opcional)

Clique no ícone de quebra-cabeça na barra do Chrome e fixe **civilium bridge**.

---

## Como usar no civilium

### 1. Verificar conexão

1. Acesse https://civiliumpro.vercel.app
2. No canto superior direito, confirme o badge **Bridge ativa** (verde)
3. Se aparecer *Extensão não detectada*, recarregue a extensão e a página

### 2. Criar uma pesquisa

1. Clique em **Nova pesquisa** no menu
2. Na tabela, cole as linhas do Excel (**Ctrl+C** no Excel → **Ctrl+V** na tabela)
   - Ordem das colunas: **nome**, **CPF**, **data de nascimento** (DD/MM/AAAA)
   - Você pode colar várias vezes — cada colagem adiciona linhas ao final
   - Use o ícone de lixeira para remover linhas
3. Alternativa: clique em **Buscar CSV no computador**
4. Clique em **Iniciar verificação**

### 3. Consultar na Receita

1. O Chrome abrirá o portal da Receita Federal em uma aba
2. Resolva o CAPTCHA para cada pessoa
3. O resultado volta automaticamente ao civilium
4. A próxima pessoa carrega na **mesma aba** até o fim da lista

### 4. Acompanhar resultados

- Use o **Painel** para ver lotes anteriores
- Abra um lote concluído para exportar o resultado em CSV

---

## Atualizar a extensão

Quando o administrador enviar uma versão nova:

1. Extraia o novo ZIP (pode substituir a pasta antiga)
2. Abra `chrome://extensions`
3. Na extensão **civilium bridge**, clique em **Recarregar**

Se não funcionar, remova a extensão e repita a instalação.

---

## Solução de problemas

| Problema | O que fazer |
|----------|-------------|
| Badge *Extensão não detectada* | Recarregue extensão + aba do civilium; confirme URL `civiliumpro.vercel.app` |
| *config_ausente* / Bridge inativa | Abra **Opções** e salve URL + chave de integração |
| Resultado não volta após CAPTCHA | Mantenha aba da Receita aberta até o comprovante; recarregue extensão |
| Consulta travada em *Em andamento* | Aguarde 5 min ou use **Abrir portal novamente** |
| Erros em `bridge.js` | Recarregue extensão; verifique service worker ativo em `chrome://extensions` |
| Chrome pede permissões | Aceite — extensão acessa civilium e portal da Receita |

---

## Suporte

Envie ao administrador:

- Versão instalada (em `chrome://extensions`)
- Print da tela do erro
- Navegador e sistema operacional

---

*© civilium — consulta cadastral na Receita Federal*
