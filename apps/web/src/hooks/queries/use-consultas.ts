"use client";

import { consultaPodeRetentar } from "@civilium/shared";
import { useQuery } from "@tanstack/react-query";
import { buscarConsultas } from "@/actions/consulta/buscar-consultas.action";

export function consultasQueryKey(loteId: string) {
  return ["consultas", loteId] as const;
}

export function useConsultas(loteId: string) {
  return useQuery({
    queryKey: consultasQueryKey(loteId),
    queryFn: async () => {
      const result = await buscarConsultas({ loteId });
      if (result?.serverError) throw new Error(result.serverError);
      return result?.data ?? [];
    },
    enabled: Boolean(loteId),
    refetchInterval: (query) => {
      const rows = query.state.data;
      if (!rows?.length) return false;

      const iniciou = rows.some((c) => c.status !== "PENDENTE");
      const pendentes = rows.some((c) => consultaPodeRetentar(c.status));
      if (!iniciou || !pendentes) return false;

      const emAndamento = rows.some((c) => c.status === "EM_ANDAMENTO");
      return emAndamento ? 2000 : 4000;
    },
  });
}
