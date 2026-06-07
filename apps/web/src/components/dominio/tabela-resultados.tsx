"use client";

import {
  consultaPodeRetentar,
  consultaTemErroDetalhe,
  encurtarMensagemErroReceita,
  type StatusConsulta,
} from "@civilium/shared";
import { formatarCpf } from "@civilium/shared";
import { ResultadoBadge } from "@/components/dominio/resultado-badge";
import { useMemo } from "react";

type ConsultaRow = {
  id: string;
  ordemNaLista: number;
  nomeInformado: string;
  cpf: string;
  nomeNaReceita: string | null;
  situacaoCadastral: string | null;
  status: StatusConsulta;
  erroMensagem: string | null;
};

type Props = {
  consultas: ConsultaRow[];
  filtroStatus?: string[];
  somentePendentes?: boolean;
  pagina?: number;
  porPagina?: number;
};

export function TabelaResultados({
  consultas,
  filtroStatus,
  somentePendentes = false,
  pagina = 1,
  porPagina = 20,
}: Props) {
  const filtradas = useMemo(() => {
    let rows = consultas;

    if (somentePendentes) {
      rows = rows.filter((c) => consultaPodeRetentar(c.status));
    }

    if (filtroStatus && filtroStatus.length > 0) {
      rows = rows.filter((c) => filtroStatus.includes(c.status));
    }

    return rows;
  }, [consultas, filtroStatus, somentePendentes]);

  const paginadas = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return filtradas.slice(inicio, inicio + porPagina);
  }, [filtradas, pagina, porPagina]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nome informado</th>
              <th className="px-4 py-3 font-medium">CPF</th>
              <th className="px-4 py-3 font-medium">Nome na Receita</th>
              <th className="px-4 py-3 font-medium">Situação Cadastral na Receita</th>
              <th className="px-4 py-3 font-medium">Resultado</th>
              <th className="px-4 py-3 font-medium">Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{c.nomeInformado}</td>
                <td className="px-4 py-3">{formatarCpf(c.cpf)}</td>
                <td className="px-4 py-3">{c.nomeNaReceita ?? "—"}</td>
                <td className="px-4 py-3">{c.situacaoCadastral ?? "—"}</td>
                <td className="px-4 py-3">
                  <ResultadoBadge
                    status={c.status}
                    erroMensagem={c.erroMensagem}
                  />
                </td>
                <td className="max-w-md px-4 py-3 text-slate-600">
                  {consultaTemErroDetalhe(c.status) && c.erroMensagem ? (
                    <p className="text-xs leading-relaxed">
                      {encurtarMensagemErroReceita(c.erroMensagem)}
                    </p>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500">
        Mostrando {paginadas.length} de {filtradas.length} pessoas
      </p>
    </div>
  );
}
