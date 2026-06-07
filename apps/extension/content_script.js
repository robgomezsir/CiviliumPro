"use strict";

let enviado = false;

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

function detectarResultado() {
  const texto = document.body.innerText.toUpperCase();

  if (texto.includes("CPF INVÁLIDO")) {
    return { status: "ERRO", mensagemErro: "CPF inválido" };
  }

  if (texto.includes("OS CARACTERES DA IMAGEM")) {
    return { status: "CAPTCHA_INVALIDO", mensagemErro: "CAPTCHA inválido" };
  }

  if (texto.includes("SERVIÇO INDISPONÍVEL")) {
    return {
      status: "PORTAL_INDISPONIVEL",
      mensagemErro: "Portal indisponível",
    };
  }

  const nome =
    document.querySelector("#NomeCompletoPF")?.textContent?.trim() ||
    document.querySelector("#clContenedorDados .clConteudoDados")?.textContent?.trim();

  if (nome) {
    return { status: "SUCESSO", nomeReceita: nome };
  }

  return null;
}

const observer = new MutationObserver(() => {
  if (enviado) return;

  const resultado = detectarResultado();
  if (!resultado) return;

  enviado = true;
  observer.disconnect();

  chrome.runtime.sendMessage({
    tipo: "resultado_receita",
    ...resultado,
  });
});

preencherFormulario();

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

setTimeout(() => {
  observer.disconnect();
}, 5 * 60 * 1000);
