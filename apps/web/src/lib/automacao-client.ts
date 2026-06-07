const baseUrl = process.env.AUTOMACAO_RECEITA_URL ?? "http://localhost:3100";
const secret = process.env.AUTOMACAO_RECEITA_SECRET ?? "dev-secret";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  };
}

export async function abrirSessaoAutomacao(loteId: string) {
  const res = await fetch(`${baseUrl}/sessao/${loteId}/abrir`, {
    method: "POST",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error("Não foi possível iniciar a sessão de consulta");
  }
  return res.json();
}

export async function iniciarConsultaAutomacao(
  loteId: string,
  payload: {
    cpf: string;
    dataNascimento: string;
    consultaId: string;
    nomeInformado?: string;
  },
) {
  const res = await fetch(`${baseUrl}/sessao/${loteId}/consulta`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        "Não foi possível iniciar a consulta",
    );
  }
  return res.json() as Promise<{ captchaImage?: string; consultaId: string }>;
}

export async function enviarCaptchaAutomacao(
  loteId: string,
  payload: { consultaId: string; captcha: string },
) {
  const res = await fetch(`${baseUrl}/sessao/${loteId}/captcha`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      (body as { message?: string }).message ??
        "Não foi possível confirmar o CAPTCHA",
    );
  }
  return body as {
    nomeNaReceita?: string;
    erroMensagem?: string;
  };
}

export async function pausarSessaoAutomacao(loteId: string) {
  await fetch(`${baseUrl}/sessao/${loteId}/pausar`, {
    method: "POST",
    headers: headers(),
  });
}

export async function fecharSessaoAutomacao(loteId: string) {
  await fetch(`${baseUrl}/sessao/${loteId}`, {
    method: "DELETE",
    headers: headers(),
  });
}

export function getEventosAutomacaoUrl(loteId: string) {
  return `/api/sessao/${loteId}/eventos`;
}
