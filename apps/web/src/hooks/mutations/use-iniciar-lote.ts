"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { iniciarLote } from "@/actions/consulta/iniciar-lote.action";
import { lotesQueryKey } from "@/hooks/queries/use-lotes";
import type { IniciarLoteInput } from "@civilium/shared";

export function useIniciarLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: IniciarLoteInput) => {
      const result = await iniciarLote(input);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) {
        throw new Error("Planilha com dados inválidos");
      }
      if (!result?.data?.loteId) throw new Error("Não foi possível criar o lote");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lotesQueryKey() });
    },
  });
}
