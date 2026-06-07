"use strict";

let enviado = false;
let intervalo = null;

function normalizarTexto(texto) {
  return (texto ?? "").replace(/\s+/g, " ").trim();
}

function preencherFormulario() {
  const params = new URLSearchParams(location.search);
  const cpf = params.get("cpf");
  const dataNascimento = params.get("dataNascimento");

  const cpfInput = document.querySelector("#txtCPF");
  const dataInput = document.querySelector("#txtDataNascimento");

  if (cpf && cpfInput && !cpfInput.value) {
    cpfInput.value = cpf;
    cpfInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (dataNascimento && dataInput && !dataInput.value) {
    dataInput.value = dataNascimento;
    dataInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function extrairMensagemErroDom() {
  const seletores = [
    ".mensagemForm",
    ".mensagemErro",
    "#mensagemErro",
    "#idMensagem",
    ".clConteudoCentro",
    "#conteudo",
    "body",
  ];

  for (const seletor of seletores) {
    const el = document.querySelector(seletor);
    const texto = normalizarTexto(el?.textContent);
    if (!texto) continue;

    if (
      /divergente|inválido|invalido|não confere|nao confere|retorne a página anterior|retorne a pagina anterior/i.test(
        texto,
      )
    ) {
      return texto;
    }
  }

  return null;
}

function extrairTrechoMensagem(texto, padrao) {
  const match = texto.match(padrao);
  return match ? normalizarTexto(match[0]) : null;
}

function detectarErroPortal(textoOriginal) {
  const texto = normalizarTexto(textoOriginal);
  const upper = texto.toUpperCase();

  if (
    /DATA DE NASCIMENTO INFORMADA/i.test(texto) &&
    /DIVERGENTE/i.test(texto)
  ) {
    return {
      status: "ERRO",
      mensagemErro:
        extrairMensagemErroDom() ||
        extrairTrechoMensagem(
          texto,
          /Data de nascimento informada[\s\S]*?(?=Retorne à página anterior e informe-o novamente!|Retorne a página anterior e informe-o novamente!|$)/i,
        ) ||
        "Data de nascimento divergente da base da Receita Federal",
    };
  }

  if (
    (/CPF INFORMADO/i.test(upper) ||
      /N[ÚU]MERO DO CPF/i.test(upper) ||
      /DADOS DO CPF/i.test(upper)) &&
    /DIVERGENTE/i.test(upper)
  ) {
    return {
      status: "ERRO",
      mensagemErro:
        extrairMensagemErroDom() ||
        extrairTrechoMensagem(
          texto,
          /CPF[\s\S]*?divergente[\s\S]*?(?=Retorne|$)/i,
        ) ||
        "CPF divergente da base da Receita Federal",
    };
  }

  if (upper.includes("CPF INVÁLIDO") || upper.includes("CPF INVALIDO")) {
    return {
      status: "ERRO",
      mensagemErro: extrairMensagemErroDom() || "CPF inválido",
    };
  }

  if (
    upper.includes("DATA DE NASCIMENTO INVÁLIDA") ||
    upper.includes("DATA DE NASCIMENTO INVALIDA")
  ) {
    return {
      status: "ERRO",
      mensagemErro:
        extrairMensagemErroDom() || "Data de nascimento inválida",
    };
  }

  if (
    upper.includes("OS CARACTERES DA IMAGEM") ||
    upper.includes("CARACTERES DA IMAGEM NÃO CONFEREM") ||
    upper.includes("CARACTERES DA IMAGEM NAO CONFEREM")
  ) {
    return {
      status: "CAPTCHA_INVALIDO",
      mensagemErro: "CAPTCHA inválido",
    };
  }

  if (
    upper.includes("SERVIÇO INDISPONÍVEL") ||
    upper.includes("SERVICO INDISPONIVEL")
  ) {
    return {
      status: "PORTAL_INDISPONIVEL",
      mensagemErro: "Portal indisponível",
    };
  }

  if (
    upper.includes("RETORNE A PÁGINA ANTERIOR") ||
    upper.includes("RETORNE A PAGINA ANTERIOR")
  ) {
    const msg = extrairMensagemErroDom();
    if (msg) {
      return { status: "ERRO", mensagemErro: msg };
    }
  }

  return null;
}

function extrairNomeReceita() {
  const direto = document.querySelector("#NomeCompletoPF")?.textContent?.trim();
  if (direto) return direto;

  const spans = document.querySelectorAll("span.clConteudoDados");
  for (const span of spans) {
    const texto = span.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (!texto) continue;

    if (/^nome\b/i.test(texto) && texto.includes(":")) {
      return texto.split(":").slice(1).join(":").trim();
    }
  }

  if (spans.length >= 2) {
    const segundo = spans[1].textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (segundo.includes(":")) {
      const [rotulo, ...valor] = segundo.split(":");
      if (/nome/i.test(rotulo)) {
        return valor.join(":").trim();
      }
    }
  }

  const container = document.querySelector("#clContenedorDados .clConteudoDados");
  const textoContainer = container?.textContent?.replace(/\s+/g, " ").trim();
  if (textoContainer?.includes(":")) {
    const [rotulo, ...valor] = textoContainer.split(":");
    if (/nome/i.test(rotulo)) {
      return valor.join(":").trim();
    }
  }

  return null;
}

function detectarResultado() {
  const texto = document.body?.innerText ?? "";

  const erro = detectarErroPortal(texto);
  if (erro) return erro;

  const nome = extrairNomeReceita();
  if (nome) {
    return { status: "SUCESSO", nomeReceita: nome };
  }

  return null;
}

function enviarResultado(resultado) {
  if (enviado) return;
  enviado = true;

  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }

  chrome.runtime.sendMessage(
    {
      tipo: "resultado_receita",
      ...resultado,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[Civilium Bridge]", chrome.runtime.lastError.message);
        enviado = false;
        return;
      }

      if (!response?.ok) {
        console.warn("[Civilium Bridge] Falha ao enviar resultado", response);
        enviado = false;
      }
    },
  );
}

function verificarResultado() {
  if (enviado) return;

  const resultado = detectarResultado();
  if (resultado) {
    enviarResultado(resultado);
  }
}

function iniciarMonitoramento() {
  preencherFormulario();
  verificarResultado();

  const observer = new MutationObserver(() => verificarResultado());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  intervalo = window.setInterval(verificarResultado, 1000);

  window.setTimeout(() => {
    observer.disconnect();
    if (intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  }, 5 * 60 * 1000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarMonitoramento);
} else {
  iniciarMonitoramento();
}
