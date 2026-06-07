"use strict";

const MAX_TENTATIVAS = 4;
const ATRASO_RETRY_MS = 250;

function contextoInvalido() {
  try {
    return !chrome?.runtime?.id;
  } catch {
    return true;
  }
}

function responderPagina(requestId, corpo) {
  window.postMessage(
    {
      source: "civilium-bridge",
      requestId,
      ...corpo,
    },
    window.location.origin,
  );
}

function enviarAoServiceWorker(data, tentativa = 0) {
  if (contextoInvalido()) {
    responderPagina(data.requestId, {
      ok: false,
      erro: "contexto_invalidado",
    });
    return;
  }

  chrome.runtime.sendMessage(
    { tipo: data.tipo, payload: data.payload },
    (response) => {
      const erroRuntime = chrome.runtime.lastError;

      if (erroRuntime) {
        const deveTentarNovamente =
          tentativa < MAX_TENTATIVAS &&
          /Receiving end does not exist|context invalidated/i.test(
            erroRuntime.message,
          );

        if (deveTentarNovamente) {
          window.setTimeout(
            () => enviarAoServiceWorker(data, tentativa + 1),
            ATRASO_RETRY_MS * (tentativa + 1),
          );
          return;
        }

        responderPagina(data.requestId, {
          ok: false,
          erro: erroRuntime.message,
        });
        return;
      }

      responderPagina(data.requestId, response ?? { ok: false });
    },
  );
}

/** Ponte entre a página Civilium e o service worker da extensão */
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const data = event.data;
  if (!data || data.source !== "civilium-web") return;
  if (!data.requestId || !data.tipo) return;

  enviarAoServiceWorker(data);
});

function sinalizarPronto() {
  if (contextoInvalido()) return;

  window.postMessage(
    { source: "civilium-bridge", tipo: "ready" },
    window.location.origin,
  );
}

sinalizarPronto();
window.setTimeout(sinalizarPronto, 500);
