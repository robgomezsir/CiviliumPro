export function mensagemErroAcao(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  const texto = error.message.toLowerCase();

  if (
    texto.includes("unexpected response") ||
    texto.includes("failed to fetch") ||
    texto.includes("networkerror") ||
    texto.includes("demorou demais")
  ) {
    return "A consulta demorou mais que o esperado. Verifique a extensão Civilium Bridge e tente novamente.";
  }

  return error.message;
}
