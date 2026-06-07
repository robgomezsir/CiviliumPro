"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { lotes } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

const schema = z.object({ loteId: z.string().uuid() });

export const buscarLote = actionClient.schema(schema).action(async ({ parsedInput }) => {
  const [lote] = await db
    .select()
    .from(lotes)
    .where(and(eq(lotes.id, parsedInput.loteId), isNull(lotes.deletedAt)))
    .limit(1);

  if (!lote) throw new Error("Lote não encontrado");

  return lote;
});
