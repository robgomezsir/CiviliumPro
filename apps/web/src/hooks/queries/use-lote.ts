"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarLote } from "@/actions/consulta/buscar-lote.action";

export function loteQueryKey(loteId: string) {
  return ["lote", loteId] as const;
}

export function useLote(loteId: string) {
  return useQuery({
    queryKey: loteQueryKey(loteId),
    queryFn: async () => {
      const result = await buscarLote({ loteId });
      if (result?.serverError) throw new Error(result.serverError);
      if (!result?.data) throw new Error("Lote não encontrado");
      return result.data;
    },
    enabled: Boolean(loteId),
  });
}
