type BridgeResponse = {
  source: "civilium-bridge";
  requestId: string;
  ok?: boolean;
  duplicado?: boolean;
  tabId?: number;
};

function enviarMensagemExtensao<T extends BridgeResponse>(
  tipo: string,
  payload?: unknown,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();

    const timeout = window.setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("Extensão Civilium Bridge não respondeu"));
    }, 10_000);

    function handler(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as BridgeResponse | undefined;
      if (!data || data.source !== "civilium-bridge") return;
      if (data.requestId !== requestId) return;

      window.clearTimeout(timeout);
      window.removeEventListener("message", handler);
      resolve(data as T);
    }

    window.addEventListener("message", handler);
    window.postMessage(
      { source: "civilium-web", requestId, tipo, payload },
      window.location.origin,
    );
  });
}

export async function pingExtensao(): Promise<boolean> {
  try {
    const res = await enviarMensagemExtensao("healthcheck");
    return Boolean(res.ok);
  } catch {
    return false;
  }
}

export async function registrarConsultaExtensao(
  payload: unknown,
): Promise<boolean> {
  const res = await enviarMensagemExtensao("registrar_consulta", payload);
  return Boolean(res.ok);
}
