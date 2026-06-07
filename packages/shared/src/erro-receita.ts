export function rotuloErroReceita(
  status: string,
  mensagem: string | null | undefined,
): string {
  const texto = (mensagem ?? "").toLowerCase();

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
