"use strict";

importScripts("config.js");

const API = `${CIVILIUM_CONFIG.API_BASE}/api/resultado-externo`;
const WEBHOOK_SECRET = CIVILIUM_CONFIG.WEBHOOK_SECRET;

/** @type {Record<number, object>} */
const consultasPorAba = {};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.tipo === "healthcheck") {
    sendResponse({ ok: true });
    return true;
  }

  if (msg.tipo === "registrar_consulta") {
    chrome.tabs
      .create({ url: msg.payload.url, active: true })
      .then((aba) => {
        const tabId = aba.id;
        if (tabId == null) {
          sendResponse({ ok: false });
          return;
        }

        consultasPorAba[tabId] = {
          ...msg.payload,
          enviado: false,
        };

        sendResponse({ ok: true, tabId });
      })
      .catch(() => sendResponse({ ok: false }));

    return true;
  }

  if (msg.tipo === "resultado_receita") {
    const tabId = sender.tab?.id;

    if (!tabId) {
      sendResponse({ ok: false });
      return true;
    }

    const consulta = consultasPorAba[tabId];

    if (!consulta) {
      sendResponse({ ok: false });
      return true;
    }

    if (consulta.enviado) {
      sendResponse({ ok: true, duplicado: true });
      return true;
    }

    consulta.enviado = true;

    fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-civilium-secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        consultaId: consulta.consultaId,
        loteId: consulta.loteId,
        tokenConsulta: consulta.tokenConsulta,
        correlationId: consulta.correlationId,
        status: msg.status,
        nomeReceita: msg.nomeReceita,
        mensagemErro: msg.mensagemErro,
      }),
    })
      .then((res) => {
        if (!res.ok) consulta.enviado = false;
        sendResponse({ ok: res.ok });
      })
      .catch(() => {
        consulta.enviado = false;
        sendResponse({ ok: false });
      });

    return true;
  }

  return false;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const consulta = consultasPorAba[tabId];
  if (!consulta) return;

  try {
    await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-civilium-secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        consultaId: consulta.consultaId,
        loteId: consulta.loteId,
        tokenConsulta: consulta.tokenConsulta,
        status: "ABANDONADO",
        mensagemErro: "Aba fechada antes de concluir a consulta",
      }),
    });
  } catch {
    /* ignorar falha de rede ao fechar aba */
  }

  delete consultasPorAba[tabId];
});
