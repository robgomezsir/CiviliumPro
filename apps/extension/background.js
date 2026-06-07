"use strict";

importScripts("config.js");

const API = `${CIVILIUM_CONFIG.API_BASE}/api/resultado-externo`;
const API_PROXIMA = `${CIVILIUM_CONFIG.API_BASE}/api/proxima-consulta`;
const WEBHOOK_SECRET = CIVILIUM_CONFIG.WEBHOOK_SECRET;
const STORAGE_PREFIX = "consulta_tab_";
const AVANCO_DELAY_MS = 900;

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

async function buscarProximaConsulta(consulta, statusResultado) {
  const repetir = ["CAPTCHA_INVALIDO", "PORTAL_INDISPONIVEL"].includes(
    statusResultado,
  );

  const response = await fetch(API_PROXIMA, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-civilium-secret": WEBHOOK_SECRET,
    },
    body: JSON.stringify({
      loteId: consulta.loteId,
      consultaIdAtual: consulta.consultaId,
      repetir,
    }),
  });

  if (!response.ok) {
    const texto = await response.text().catch(() => "");
    throw new Error(`Proxima consulta ${response.status}: ${texto}`);
  }

  return response.json();
}

async function avancarFilaLote(tabId, consulta, statusResultado) {
  if (!consulta.modoLote) return;

  await new Promise((resolve) => setTimeout(resolve, AVANCO_DELAY_MS));

  const proxima = await buscarProximaConsulta(consulta, statusResultado);

  if (proxima.fim) {
    await removerConsulta(tabId);
    return;
  }

  await persistirConsulta(tabId, {
    consultaId: proxima.consultaId,
    loteId: proxima.loteId,
    correlationId: proxima.correlationId,
    tokenConsulta: proxima.tokenConsulta,
    url: proxima.url,
    ordemNaLista: proxima.ordemNaLista,
    nomeInformado: proxima.nomeInformado,
    modoLote: true,
    enviado: false,
  });

  await chrome.tabs.update(tabId, { url: proxima.url, active: true });
}

async function abrirConsultaNaAba(msg, sendResponse) {
  const payload = msg.payload ?? {};
  const modoLote = Boolean(payload.modoLote ?? msg.modoLote);
  const tabIdExistente = msg.tabId;

  const consulta = {
    ...payload,
    modoLote,
    enviado: false,
  };

  if (tabIdExistente != null) {
    await persistirConsulta(tabIdExistente, consulta);
    await chrome.tabs.update(tabIdExistente, {
      url: payload.url,
      active: true,
    });
    sendResponse({ ok: true, tabId: tabIdExistente });
    return;
  }

  const aba = await chrome.tabs.create({ url: payload.url, active: true });
  const tabId = aba.id;

  if (tabId == null) {
    sendResponse({ ok: false, erro: "sem_tab" });
    return;
  }

  await persistirConsulta(tabId, consulta);
  sendResponse({ ok: true, tabId });
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
    abrirConsultaNaAba(msg, sendResponse).catch((error) => {
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

          const deveAvancar =
            consulta.modoLote &&
            ["SUCESSO", "ERRO", "CAPTCHA_INVALIDO", "PORTAL_INDISPONIVEL"].includes(
              msg.status,
            );

          if (deveAvancar) {
            await avancarFilaLote(tabId, consulta, msg.status);
          }
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
