"use client";

import type { listarLotesSchema } from "@civilium/shared";
import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { listarLotes } from "@/actions/consulta/listar-lotes.action";

export type FiltrosLotes = z.infer<typeof listarLotesSchema>;

export function lotesQueryKey(filtros?: Partial<FiltrosLotes>) {
  return ["lotes", filtros ?? {}] as const;
}

export function useLotes(filtros?: Partial<FiltrosLotes>) {
  return useQuery({
    queryKey: lotesQueryKey(filtros),
    queryFn: async () => {
      const result = await listarLotes({
        status: "TODOS",
        incluirDescartados: false,
        ...filtros,
      });
      if (result?.serverError) throw new Error(result.serverError);
      return result?.data ?? [];
    },
    staleTime: 15_000,
  });
}
