"use server";

import { concluirLoteSchema } from "@civilium/shared";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { auditoriaEventos, lotes } from "@/db/schema";
import { fecharSessaoAutomacao } from "@/lib/automacao-client";
import { actionClient } from "@/lib/safe-action";

export const concluirLote = actionClient
  .schema(concluirLoteSchema)
  .action(async ({ parsedInput }) => {
    await db.transaction(async (tx) => {
      const [antes] = await tx
        .select()
        .from(lotes)
        .where(
          and(eq(lotes.id, parsedInput.loteId), isNull(lotes.deletedAt)),
        )
        .limit(1);

      if (!antes) throw new Error("Lote não encontrado");

      const [depois] = await tx
        .update(lotes)
        .set({
          status: "CONCLUIDO",
          updatedAt: new Date(),
        })
        .where(eq(lotes.id, parsedInput.loteId))
        .returning();

      await tx.insert(auditoriaEventos).values({
        entidade: "lote",
        entidadeId: parsedInput.loteId,
        acao: "CONCLUIR",
        snapshotAntes: antes,
        snapshotDepois: depois,
      });
    });

    await fecharSessaoAutomacao(parsedInput.loteId);

    return { ok: true };
  });
