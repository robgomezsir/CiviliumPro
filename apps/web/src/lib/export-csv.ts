import { formatarCpf } from "@civilium/shared";

type LinhaExportacao = {
  nomeInformado: string;
  cpf: string;
  nomeNaReceita: string | null;
  status: string;
  consultadaEm: Date | null;
};

export function gerarCsvResultados(linhas: LinhaExportacao[]): string {
  const header = [
    "Nome informado",
    "CPF",
    "Nome na Receita",
    "Resultado",
    "Consultada em",
  ];
  const rows = linhas.map((l) => [
    l.nomeInformado,
    formatarCpf(l.cpf),
    l.nomeNaReceita ?? "",
    l.status === "NAO_CONFERE" ? "NÃO CONFERE" : l.status,
    l.consultadaEm ? l.consultadaEm.toISOString() : "",
  ]);
  return [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}
