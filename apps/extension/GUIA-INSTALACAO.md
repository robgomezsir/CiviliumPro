# Civilium Bridge — Guia de instalação

Extensão Chrome que conecta o **Civilium** ao portal da Receita Federal para consultas em lote.

**Versão:** {{VERSION}}  
**Site:** https://civiliumpro.vercel.app

---

## Antes de começar

| Requisito | Detalhe |
|-----------|---------|
| Navegador | Google Chrome (versão recente) |
| Arquivo recebido | `{{ZIP_NAME}}` (enviado pelo administrador) |
| Permissão | Modo do desenvolvedor no Chrome (passo a passo abaixo) |

> O pacote já vem configurado. **Não altere** os arquivos da extensão.

---

## Instalação passo a passo

### 1. Extrair o ZIP

1. Salve o arquivo `{{ZIP_NAME}}` em uma pasta fixa, por exemplo:
   - Windows: `C:\Civilium\{{FOLDER_NAME}}`
   - Mac: `~/Civilium/{{FOLDER_NAME}}`
2. Clique com o botão direito no ZIP e escolha **Extrair tudo**.
3. Confirme que dentro da pasta existem arquivos como `manifest.json` e `background.js`.

### 2. Abrir a página de extensões do Chrome

Na barra de endereço do Chrome, digite e pressione Enter:

```
chrome://extensions
```

### 3. Ativar o Modo do desenvolvedor

No canto superior direito da página, ative a chave **Modo do desenvolvedor**.

### 4. Carregar a extensão

1. Clique em **Carregar sem compactação** (ou **Load unpacked**).
2. Selecione a pasta extraída (`{{FOLDER_NAME}}`).
3. Confirme que aparece **Civilium Bridge** na lista, versão **{{VERSION}}**.

### 5. Fixar a extensão (opcional)

Clique no ícone de quebra-cabeça na barra do Chrome e fixe **Civilium Bridge** para acesso rápido.

---

## Como usar

1. Acesse https://civiliumpro.vercel.app
2. Envie ou abra um lote de consultas
3. Clique em **Iniciar verificação em lote** ou **Abrir portal**
4. O Chrome abrirá o portal da Receita Federal
5. Resolva o CAPTCHA para cada pessoa
6. O resultado volta automaticamente ao Civilium; a próxima pessoa é carregada na mesma aba

---

## Atualizar a extensão

Quando o administrador enviar uma versão nova:

1. Extraia o novo ZIP (pode substituir a pasta antiga)
2. Abra `chrome://extensions`
3. Na extensão **Civilium Bridge**, clique em **Recarregar** (ícone circular)

Se a atualização não funcionar, remova a extensão e repita a instalação com a pasta nova.

---

## Solução de problemas

### A extensão não aparece no Civilium

- Recarregue a extensão em `chrome://extensions`
- Feche e abra novamente a aba do Civilium
- Confirme que está em https://civiliumpro.vercel.app (não outro endereço)

### O resultado não volta após o CAPTCHA

- Mantenha a aba da Receita aberta até aparecer o comprovante
- Recarregue a extensão em `chrome://extensions`
- No Civilium, clique em **Abrir portal novamente**

### Consulta travada em "Em andamento"

- Aguarde até 5 minutos (expiração automática) ou recarregue a página do lote
- Use **Abrir portal novamente**

### Chrome pede permissões

Aceite as permissões solicitadas. A extensão precisa acessar:

- O site do Civilium
- O portal da Receita Federal (`servicos.receita.fazenda.gov.br`)

---

## Suporte

Em caso de dúvida, envie ao administrador:

- Versão instalada (visível em `chrome://extensions`)
- Print da tela do erro
- Navegador e sistema operacional

---

*Civilium — consulta cadastral na Receita Federal*
