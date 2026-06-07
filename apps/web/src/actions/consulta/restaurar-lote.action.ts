"use server";

import { restaurarLoteSchema } from "@civilium/shared";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditoriaEventos, lotes } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

export const restaurarLote = actionClient
  .schema(restaurarLoteSchema)
  .action(async ({ parsedInput }) => {
    await db.transaction(async (tx) => {
      const [antes] = await tx
        .select()
        .from(lotes)
        .where(eq(lotes.id, parsedInput.loteId))
        .limit(1);

      if (!antes) throw new Error("Lote não encontrado");
      if (antes.status !== "DESCARTADO") {
        throw new Error("Somente lotes descartados podem ser restaurados");
      }

      const statusRestaurado =
        antes.consultadasCount >= antes.totalPessoas
          ? "CONCLUIDO"
          : antes.consultadasCount > 0
            ? "EM_CONSULTA"
            : "AGUARDANDO";

      const [depois] = await tx
        .update(lotes)
        .set({
          status: statusRestaurado,
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(lotes.id, parsedInput.loteId))
        .returning();

      await tx.insert(auditoriaEventos).values({
        entidade: "lote",
        entidadeId: parsedInput.loteId,
        acao: "RESTAURAR",
        snapshotAntes: antes,
        snapshotDepois: depois,
      });
    });

    return { ok: true };
  });
