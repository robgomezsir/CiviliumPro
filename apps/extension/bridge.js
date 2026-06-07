"use strict";

/** Ponte entre a página Civilium e o service worker da extensão */
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const data = event.data;
  if (!data || data.source !== "civilium-web") return;

  chrome.runtime.sendMessage(
    { tipo: data.tipo, payload: data.payload },
    (response) => {
      window.postMessage(
        {
          source: "civilium-bridge",
          requestId: data.requestId,
          ...(response ?? { ok: false }),
        },
        window.location.origin,
      );
    },
  );
});

window.postMessage(
  { source: "civilium-bridge", tipo: "ready" },
  window.location.origin,
);
