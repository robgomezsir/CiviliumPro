export const STATUS_CONSULTA = [
  "PENDENTE",
  "EM_ANDAMENTO",
  "CONFERE",
  "NAO_CONFERE",
  "ERRO",
  "ABANDONADO",
  "EXPIRADO",
  "CAPTCHA_INVALIDO",
  "PORTAL_INDISPONIVEL",
] as const;

export type StatusConsulta = (typeof STATUS_CONSULTA)[number];

export const STATUS_CONSULTA_PENDENTE: StatusConsulta[] = [
  "PENDENTE",
  "EM_ANDAMENTO",
];

export const STATUS_CONSULTA_FINAL: StatusConsulta[] = [
  "CONFERE",
  "NAO_CONFERE",
  "ERRO",
  "ABANDONADO",
  "EXPIRADO",
  "CAPTCHA_INVALIDO",
  "PORTAL_INDISPONIVEL",
];

export const STATUS_CONSULTA_RETENTAVEL: StatusConsulta[] = [
  "ABANDONADO",
  "EXPIRADO",
  "CAPTCHA_INVALIDO",
  "PORTAL_INDISPONIVEL",
];

export function consultaEstaPendente(status: StatusConsulta): boolean {
  return status === "PENDENTE" || status === "EM_ANDAMENTO";
}

export function consultaPodeRetentar(status: StatusConsulta): boolean {
  return (
    consultaEstaPendente(status) ||
    STATUS_CONSULTA_RETENTAVEL.includes(status)
  );
}

export function consultaEstaFinalizada(status: StatusConsulta): boolean {
  return !consultaPodeRetentar(status);
}
