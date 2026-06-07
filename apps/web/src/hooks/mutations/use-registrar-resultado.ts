"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarResultado } from "@/actions/consulta/registrar-resultado.action";
import { consultasQueryKey } from "@/hooks/queries/use-consultas";
import { loteQueryKey } from "@/hooks/queries/use-lote";
import { lotesQueryKey } from "@/hooks/queries/use-lotes";

export function useRegistrarResultado(loteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      consultaId: string;
      nomeNaReceita?: string;
      erroMensagem?: string;
    }) => {
      const result = await registrarResultado({
        loteId,
        consultaId: input.consultaId,
        nomeNaReceita: input.nomeNaReceita,
        erroMensagem: input.erroMensagem,
      });
      if (result?.serverError) throw new Error(result.serverError);
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultasQueryKey(loteId) });
      queryClient.invalidateQueries({ queryKey: loteQueryKey(loteId) });
      queryClient.invalidateQueries({ queryKey: lotesQueryKey() });
    },
  });
}
