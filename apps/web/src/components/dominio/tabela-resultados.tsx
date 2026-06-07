"use client";

import { formatarCpf } from "@civilium/shared";
import { ResultadoBadge } from "@/components/dominio/resultado-badge";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useMemo, useState } from "react";

type ConsultaRow = {
  id: string;
  ordemNaLista: number;
  nomeInformado: string;
  cpf: string;
  nomeNaReceita: string | null;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONFERE" | "NAO_CONFERE" | "ERRO";
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
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 300);

  const filtradas = useMemo(() => {
    let rows = consultas;

    if (somentePendentes) {
      rows = rows.filter(
        (c) => c.status === "PENDENTE" || c.status === "EM_ANDAMENTO",
      );
    }

    if (filtroStatus && filtroStatus.length > 0) {
      rows = rows.filter((c) => filtroStatus.includes(c.status));
    }

    if (buscaDebounced) {
      const termo = buscaDebounced.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.nomeInformado.toLowerCase().includes(termo) ||
          (c.nomeNaReceita?.toLowerCase().includes(termo) ?? false),
      );
    }

    return rows;
  }, [consultas, filtroStatus, somentePendentes, buscaDebounced]);

  const inicio = (pagina - 1) * porPagina;
  const paginadas = filtradas.slice(inicio, inicio + porPagina);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        aria-label="Buscar por nome"
      />
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Nome informado</th>
              <th className="px-4 py-3 font-medium">CPF</th>
              <th className="px-4 py-3 font-medium">Nome na Receita</th>
              <th className="px-4 py-3 font-medium">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma pessoa encontrada
                </td>
              </tr>
            ) : (
              paginadas.map((consulta) => (
                <tr key={consulta.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{consulta.ordemNaLista}</td>
                  <td className="px-4 py-3">{consulta.nomeInformado}</td>
                  <td className="px-4 py-3 font-mono">{formatarCpf(consulta.cpf)}</td>
                  <td className="px-4 py-3">
                    {consulta.nomeNaReceita ?? consulta.erroMensagem ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ResultadoBadge status={consulta.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-600">
        Mostrando {paginadas.length} de {filtradas.length} pessoas
      </p>
    </div>
  );
}
