"use strict";

let enviado = false;
let intervalo = null;

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
  const texto = document.body?.innerText?.toUpperCase() ?? "";

  if (texto.includes("CPF INVÁLIDO") || texto.includes("CPF INVALIDO")) {
    return { status: "ERRO", mensagemErro: "CPF inválido" };
  }

  if (
    texto.includes("OS CARACTERES DA IMAGEM") ||
    texto.includes("CARACTERES DA IMAGEM NÃO CONFEREM") ||
    texto.includes("CARACTERES DA IMAGEM NAO CONFEREM")
  ) {
    return { status: "CAPTCHA_INVALIDO", mensagemErro: "CAPTCHA inválido" };
  }

  if (texto.includes("SERVIÇO INDISPONÍVEL") || texto.includes("SERVICO INDISPONIVEL")) {
    return {
      status: "PORTAL_INDISPONIVEL",
      mensagemErro: "Portal indisponível",
    };
  }

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
