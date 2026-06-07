"use server";

import { pausarLoteSchema } from "@civilium/shared";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { lotes } from "@/db/schema";
import { pausarSessaoAutomacao } from "@/lib/automacao-client";
import { actionClient } from "@/lib/safe-action";

export const pausarLote = actionClient
  .schema(pausarLoteSchema)
  .action(async ({ parsedInput }) => {
    const [lote] = await db
      .update(lotes)
      .set({
        pausado: parsedInput.pausado ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(
        and(eq(lotes.id, parsedInput.loteId), isNull(lotes.deletedAt)),
      )
      .returning();

    if (!lote) throw new Error("Lote não encontrado");

    if (parsedInput.pausado) {
      await pausarSessaoAutomacao(parsedInput.loteId);
    }

    return { pausado: Boolean(lote.pausado) };
  });
