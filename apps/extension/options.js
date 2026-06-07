"use strict";

const DEFAULT_API_BASE = "https://civiliumpro.vercel.app";

const form = document.getElementById("form");
const apiBaseInput = document.getElementById("apiBase");
const webhookSecretInput = document.getElementById("webhookSecret");
const toggleSecretBtn = document.getElementById("toggleSecret");
const statusEl = document.getElementById("status");

function mostrarStatus(mensagem, ok) {
  statusEl.textContent = mensagem;
  statusEl.className = `status ${ok ? "ok" : "err"}`;
}

async function carregar() {
  const { apiBase, webhookSecret } = await chrome.storage.local.get([
    "apiBase",
    "webhookSecret",
  ]);

  apiBaseInput.value = apiBase || DEFAULT_API_BASE;
  webhookSecretInput.value = webhookSecret || "";
}

toggleSecretBtn.addEventListener("click", () => {
  const mostrar = webhookSecretInput.type === "password";
  webhookSecretInput.type = mostrar ? "text" : "password";
  toggleSecretBtn.textContent = mostrar ? "Ocultar chave" : "Mostrar chave";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiBase = apiBaseInput.value.trim().replace(/\/$/, "");
  const webhookSecret = webhookSecretInput.value.trim();

  if (!apiBase || !webhookSecret) {
    mostrarStatus("Preencha a URL e a chave de integração.", false);
    return;
  }

  try {
    new URL(apiBase);
  } catch {
    mostrarStatus("URL do Civilium inválida.", false);
    return;
  }

  await chrome.storage.local.set({ apiBase, webhookSecret });
  mostrarStatus("Configuração salva. Recarregue a aba do Civilium se estiver aberta.", true);
});

carregar().catch(() => {
  mostrarStatus("Não foi possível carregar a configuração.", false);
});
