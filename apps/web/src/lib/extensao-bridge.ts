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

async function aguardar(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function pingExtensao(): Promise<boolean> {
  for (let tentativa = 0; tentativa < 4; tentativa += 1) {
    try {
      const res = await enviarMensagemExtensao("healthcheck");
      if (res.ok) return true;
    } catch {
      if (tentativa < 3) await aguardar(400 * (tentativa + 1));
    }
  }

  return false;
}

export async function registrarConsultaExtensao(
  payload: unknown,
): Promise<boolean> {
  const res = await enviarMensagemExtensao("registrar_consulta", payload);
  return Boolean(res.ok);
}
