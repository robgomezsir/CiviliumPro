import { RECEITA_CONSULTA_URL } from "./receita-constants";

export function montarUrlReceita(cpf: string, dataNascimento: string): string {
  const url = new URL(RECEITA_CONSULTA_URL);
  url.searchParams.set("cpf", cpf);
  url.searchParams.set("dataNascimento", dataNascimento);
  return url.toString();
}
