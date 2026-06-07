"use client";

import { useQuery } from "@tanstack/react-query";
import { listarLotes } from "@/actions/consulta/listar-lotes.action";

export function lotesQueryKey() {
  return ["lotes"] as const;
}

export function useLotes() {
  return useQuery({
    queryKey: lotesQueryKey(),
    queryFn: async () => {
      const result = await listarLotes();
      if (result?.serverError) throw new Error(result.serverError);
      return result?.data ?? [];
    },
    staleTime: 30_000,
  });
}
