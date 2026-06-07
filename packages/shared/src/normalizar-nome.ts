export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function nomesConferem(nomeInformado: string, nomeNaReceita: string): boolean {
  return normalizarNome(nomeInformado) === normalizarNome(nomeNaReceita);
}
