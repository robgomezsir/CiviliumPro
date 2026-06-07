"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atualizarLote } from "@/actions/consulta/atualizar-lote.action";
import { descartarLote } from "@/actions/consulta/descartar-lote.action";
import { restaurarLote } from "@/actions/consulta/restaurar-lote.action";
export function useAtualizarLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { loteId: string; nomeArquivo: string }) => {
      const result = await atualizarLote(input);
      if (result?.serverError) throw new Error(result.serverError);
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}

export function useDescartarLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loteId: string) => {
      const result = await descartarLote({ loteId });
      if (result?.serverError) throw new Error(result.serverError);
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}

export function useRestaurarLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loteId: string) => {
      const result = await restaurarLote({ loteId });
      if (result?.serverError) throw new Error(result.serverError);
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}
