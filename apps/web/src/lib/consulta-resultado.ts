import { encurtarMensagemErroReceita, nomesConferem } from "@civilium/shared";
import type { StatusConsulta } from "@/db/schema/consulta";

type ResultadoExternoBody = {
  status: string;
  nomeReceita?: string | null;
  situacaoCadastral?: string | null;
  mensagemErro?: string | null;
};

export function resolverStatusConsulta(
  nomeInformado: string,
  body: ResultadoExternoBody,
): {
  status: StatusConsulta;
  nomeNaReceita: string | null;
  situacaoCadastral: string | null;
  erroMensagem: string | null;
} {
  if (body.status === "SUCESSO" && body.nomeReceita) {
    const confere = nomesConferem(nomeInformado, body.nomeReceita);
    return {
      status: confere ? "CONFERE" : "NAO_CONFERE",
      nomeNaReceita: body.nomeReceita,
      situacaoCadastral: body.situacaoCadastral ?? null,
      erroMensagem: null,
    };
  }

  const statusTerminal = body.status as StatusConsulta;
  const statusesValidos: StatusConsulta[] = [
    "ERRO",
    "ABANDONADO",
    "EXPIRADO",
    "CAPTCHA_INVALIDO",
    "PORTAL_INDISPONIVEL",
  ];

  if (statusesValidos.includes(statusTerminal)) {
    return {
      status: statusTerminal,
      nomeNaReceita: body.nomeReceita ?? null,
      situacaoCadastral: body.situacaoCadastral ?? null,
      erroMensagem: encurtarMensagemErroReceita(body.mensagemErro),
    };
  }

  return {
    status: "ERRO",
    nomeNaReceita: null,
    situacaoCadastral: null,
    erroMensagem:
      encurtarMensagemErroReceita(body.mensagemErro) ??
      "Resultado inválido recebido da extensão",
  };
}
