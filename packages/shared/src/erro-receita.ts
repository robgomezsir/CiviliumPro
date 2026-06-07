export function encurtarMensagemErroReceita(
  mensagem: string | null | undefined,
): string | null {
  if (!mensagem) return null;

  const texto = mensagem.replace(/\s+/g, " ").trim();
  if (!texto) return null;

  if (/cpf incorreto/i.test(texto)) {
    return "CPF incorreto.";
  }

  const dataMatch = texto.match(
    /data de nascimento informada\s+(\d{2}\/\d{2}\/\d{4})/i,
  );
  if (dataMatch && /divergente/i.test(texto)) {
    return `Data de nascimento informada ${dataMatch[1]} divergente`;
  }

  if (/cpf inv[aá]lido/i.test(texto)) {
    return "CPF inválido.";
  }

  if (/cpf.*divergente|divergente.*cpf/i.test(texto)) {
    return "CPF divergente.";
  }

  if (/data de nascimento inv[aá]lida/i.test(texto)) {
    return "Data de nascimento inválida.";
  }

  const antesRetorne = texto.split(/Retorne/i)[0]?.trim();
  if (
    antesRetorne &&
    antesRetorne.length < texto.length &&
    antesRetorne.length >= 8
  ) {
    const limpo = antesRetorne.replace(/\.\s*$/, "");
    return `${limpo}.`;
  }

  return texto.length > 120 ? `${texto.slice(0, 117)}...` : texto;
}

export function rotuloErroReceita(
  status: string,
  mensagem: string | null | undefined,
): string {
  const texto = encurtarMensagemErroReceita(mensagem)?.toLowerCase() ?? "";

  if (texto.includes("cpf incorreto")) {
    return "CPF incorreto";
  }

  if (texto.includes("data de nascimento")) {
    return "Data divergente";
  }

  if (texto.includes("cpf")) {
    return "CPF divergente";
  }

  if (status === "CAPTCHA_INVALIDO") return "CAPTCHA inválido";
  if (status === "PORTAL_INDISPONIVEL") return "Portal indisponível";
  if (status === "ABANDONADO") return "Abandonado";
  if (status === "EXPIRADO") return "Expirado";

  return "ERRO";
}

export function consultaTemErroDetalhe(status: string): boolean {
  return [
    "ERRO",
    "CAPTCHA_INVALIDO",
    "PORTAL_INDISPONIVEL",
    "ABANDONADO",
    "EXPIRADO",
  ].includes(status);
}
