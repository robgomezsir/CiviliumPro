"use server";

import { excluirLoteSchema } from "@civilium/shared";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditoriaEventos, consultas, lotes } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

export const excluirLote = actionClient
  .schema(excluirLoteSchema)
  .action(async ({ parsedInput }) => {
    await db.transaction(async (tx) => {
      const [lote] = await tx
        .select()
        .from(lotes)
        .where(eq(lotes.id, parsedInput.loteId))
        .limit(1);

      if (!lote) throw new Error("Lote não encontrado");

      const consultasDoLote = await tx
        .select()
        .from(consultas)
        .where(eq(consultas.loteId, parsedInput.loteId));

      await tx.insert(auditoriaEventos).values({
        entidade: "lote",
        entidadeId: parsedInput.loteId,
        acao: "EXCLUIR",
        snapshotAntes: { lote, consultas: consultasDoLote },
        snapshotDepois: null,
      });

      await tx
        .delete(consultas)
        .where(eq(consultas.loteId, parsedInput.loteId));

      await tx.delete(lotes).where(eq(lotes.id, parsedInput.loteId));
    });

    return { ok: true };
  });
