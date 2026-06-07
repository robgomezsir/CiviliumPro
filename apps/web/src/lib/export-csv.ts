import {
  encurtarMensagemErroReceita,
  formatarCpf,
  type StatusConsulta,
} from "@civilium/shared";

const labelsStatus: Record<StatusConsulta, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONFERE: "CONFERE",
  NAO_CONFERE: "NÃO CONFERE",
  ERRO: "ERRO",
  ABANDONADO: "Abandonado",
  EXPIRADO: "Expirado",
  CAPTCHA_INVALIDO: "CAPTCHA inválido",
  PORTAL_INDISPONIVEL: "Portal indisponível",
};

type LinhaExportacao = {
  nomeInformado: string;
  cpf: string;
  nomeNaReceita: string | null;
  status: string;
  erroMensagem?: string | null;
  consultadaEm: Date | null;
};

export function gerarCsvResultados(linhas: LinhaExportacao[]): string {
  const header = [
    "Nome informado",
    "CPF",
    "Nome na Receita",
    "Resultado",
    "Detalhe do erro",
    "Consultada em",
  ];
  const rows = linhas.map((l) => [
    l.nomeInformado,
    formatarCpf(l.cpf),
    l.nomeNaReceita ?? "",
    labelsStatus[l.status as StatusConsulta] ?? l.status,
    encurtarMensagemErroReceita(l.erroMensagem) ?? "",
    l.consultadaEm ? l.consultadaEm.toISOString() : "",
  ]);
  return [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}
