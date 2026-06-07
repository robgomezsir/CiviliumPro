"use strict";

importScripts("config.js");

const API = `${CIVILIUM_CONFIG.API_BASE}/api/resultado-externo`;
const WEBHOOK_SECRET = CIVILIUM_CONFIG.WEBHOOK_SECRET;
const STORAGE_PREFIX = "consulta_tab_";

/** @type {Record<number, object>} */
const consultasPorAba = {};

async function persistirConsulta(tabId, consulta) {
  consultasPorAba[tabId] = consulta;
  await chrome.storage.session.set({ [`${STORAGE_PREFIX}${tabId}`]: consulta });
}

async function recuperarConsulta(tabId) {
  if (consultasPorAba[tabId]) {
    return consultasPorAba[tabId];
  }

  const key = `${STORAGE_PREFIX}${tabId}`;
  const data = await chrome.storage.session.get(key);
  const consulta = data[key];

  if (consulta) {
    consultasPorAba[tabId] = consulta;
    return consulta;
  }

  return null;
}

async function removerConsulta(tabId) {
  delete consultasPorAba[tabId];
  await chrome.storage.session.remove(`${STORAGE_PREFIX}${tabId}`);
}

async function enviarWebhook(payload) {
  const response = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-civilium-secret": WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const texto = await response.text().catch(() => "");
    throw new Error(`Webhook ${response.status}: ${texto}`);
  }

  return response.json().catch(() => ({ ok: true }));
}

chrome.runtime.onStartup.addListener(async () => {
  const all = await chrome.storage.session.get(null);
  for (const [key, value] of Object.entries(all)) {
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    const tabId = Number(key.slice(STORAGE_PREFIX.length));
    if (!Number.isNaN(tabId)) {
      consultasPorAba[tabId] = value;
    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.tipo === "healthcheck") {
    sendResponse({ ok: true });
    return true;
  }

  if (msg.tipo === "registrar_consulta") {
    chrome.tabs
      .create({ url: msg.payload.url, active: true })
      .then(async (aba) => {
        const tabId = aba.id;
        if (tabId == null) {
          sendResponse({ ok: false, erro: "sem_tab" });
          return;
        }

        await persistirConsulta(tabId, {
          ...msg.payload,
          enviado: false,
        });

        sendResponse({ ok: true, tabId });
      })
      .catch((error) => {
        sendResponse({
          ok: false,
          erro: error instanceof Error ? error.message : "erro_ao_abrir",
        });
      });

    return true;
  }

  if (msg.tipo === "resultado_receita") {
    const tabId = sender.tab?.id;

    if (!tabId) {
      sendResponse({ ok: false, erro: "sem_tab" });
      return true;
    }

    recuperarConsulta(tabId)
      .then(async (consulta) => {
        if (!consulta) {
          sendResponse({ ok: false, erro: "consulta_nao_registrada" });
          return;
        }

        if (consulta.enviado) {
          sendResponse({ ok: true, duplicado: true });
          return;
        }

        consulta.enviado = true;
        await persistirConsulta(tabId, consulta);

        try {
          await enviarWebhook({
            consultaId: consulta.consultaId,
            loteId: consulta.loteId,
            tokenConsulta: consulta.tokenConsulta,
            correlationId: consulta.correlationId,
            status: msg.status,
            nomeReceita: msg.nomeReceita,
            mensagemErro: msg.mensagemErro,
          });

          sendResponse({ ok: true });
        } catch (error) {
          consulta.enviado = false;
          await persistirConsulta(tabId, consulta);
          sendResponse({
            ok: false,
            erro: error instanceof Error ? error.message : "webhook_falhou",
          });
        }
      })
      .catch((error) => {
        sendResponse({
          ok: false,
          erro: error instanceof Error ? error.message : "erro_interno",
        });
      });

    return true;
  }

  return false;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const consulta = await recuperarConsulta(tabId);
  if (!consulta || consulta.enviado) {
    await removerConsulta(tabId);
    return;
  }

  try {
    await enviarWebhook({
      consultaId: consulta.consultaId,
      loteId: consulta.loteId,
      tokenConsulta: consulta.tokenConsulta,
      status: "ABANDONADO",
      mensagemErro: "Aba fechada antes de concluir a consulta",
    });
  } catch {
    /* ignorar falha de rede ao fechar aba */
  }

  await removerConsulta(tabId);
});
