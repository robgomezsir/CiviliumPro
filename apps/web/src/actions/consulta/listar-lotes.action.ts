"use server";

import { listarLotesSchema } from "@civilium/shared";
import { and, desc, eq, ilike, isNull } from "drizzle-orm";
import { db } from "@/db";
import { lotes } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

export const listarLotes = actionClient
  .schema(listarLotesSchema)
  .action(async ({ parsedInput }) => {
    const condicoes = [];

    if (parsedInput.status === "DESCARTADO") {
      condicoes.push(eq(lotes.status, "DESCARTADO"));
    } else if (parsedInput.status !== "TODOS") {
      condicoes.push(eq(lotes.status, parsedInput.status));
      condicoes.push(isNull(lotes.deletedAt));
    } else if (!parsedInput.incluirDescartados) {
      condicoes.push(isNull(lotes.deletedAt));
    }

    if (parsedInput.busca?.trim()) {
      condicoes.push(ilike(lotes.nomeArquivo, `%${parsedInput.busca.trim()}%`));
    }

    const where =
      condicoes.length > 0 ? and(...condicoes) : undefined;

    return db
      .select()
      .from(lotes)
      .where(where)
      .orderBy(desc(lotes.createdAt))
      .limit(100);
  });
