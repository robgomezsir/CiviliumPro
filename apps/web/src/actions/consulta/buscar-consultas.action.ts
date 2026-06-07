"use server";

import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultas } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

const schema = z.object({ loteId: z.string().uuid() });

export const buscarConsultas = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    return db
      .select()
      .from(consultas)
      .where(eq(consultas.loteId, parsedInput.loteId))
      .orderBy(asc(consultas.ordemNaLista));
  });
