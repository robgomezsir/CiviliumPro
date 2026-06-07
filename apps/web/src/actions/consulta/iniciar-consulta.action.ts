"use server";

import crypto from "node:crypto";
import { consultaPodeRetentar } from "@civilium/shared";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { consultas, lotes } from "@/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { montarUrlReceita } from "@/lib/receita-url";
import { actionClient } from "@/lib/safe-action";

const schema = z.object({
  loteId: z.string().uuid(),
  consultaId: z.string().uuid(),
});

export const iniciarConsulta = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    if (!checkRateLimit(`consulta-${parsedInput.loteId}`, 30, 60_000)) {
      throw new Error("Muitas consultas em sequência. Aguarde um momento.");
    }

    const [consulta] = await db
      .select()
      .from(consultas)
      .where(
        and(
          eq(consultas.id, parsedInput.consultaId),
          eq(consultas.loteId, parsedInput.loteId),
        ),
      )
      .limit(1);

    if (!consulta) {
      throw new Error("Consulta não encontrada");
    }

    if (!consultaPodeRetentar(consulta.status)) {
      throw new Error("Esta pessoa já foi verificada");
    }

    const tokenConsulta = crypto.randomUUID();
    const correlationId = crypto.randomUUID();
    const agora = new Date();
    const ehRetentativa = consulta.resultadoRecebidoEm != null;

    await db.transaction(async (tx) => {
      if (ehRetentativa) {
        await tx
          .update(lotes)
          .set({
            consultadasCount: sql`GREATEST(0, ${lotes.consultadasCount} - 1)`,
            updatedAt: agora,
          })
          .where(eq(lotes.id, consulta.loteId));
      }

      await tx
        .update(consultas)
        .set({
          status: "EM_ANDAMENTO",
          tokenConsulta,
          abaAbertaEm: agora,
          resultadoRecebidoEm: null,
          consultadaEm: null,
          erroMensagem: null,
          nomeNaReceita: null,
        })
        .where(eq(consultas.id, parsedInput.consultaId));
    });

    return {
      consultaId: parsedInput.consultaId,
      loteId: consulta.loteId,
      correlationId,
      tokenConsulta,
      url: montarUrlReceita(consulta.cpf, consulta.dataNascimento),
    };
  });
