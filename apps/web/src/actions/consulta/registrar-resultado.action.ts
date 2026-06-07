"use server";

import { nomesConferem, registrarResultadoSchema } from "@civilium/shared";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { consultas, lotes } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

export const registrarResultado = actionClient
  .schema(registrarResultadoSchema)
  .action(async ({ parsedInput }) => {
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

    if (!consulta) throw new Error("Consulta não encontrada");

    let status: "CONFERE" | "NAO_CONFERE" | "ERRO";
    let nomeNaReceita: string | null = null;
    let erroMensagem: string | null = null;

    if (parsedInput.erroMensagem) {
      status = "ERRO";
      erroMensagem = parsedInput.erroMensagem;
    } else if (!parsedInput.nomeNaReceita) {
      status = "ERRO";
      erroMensagem = "Não foi possível obter o nome na Receita Federal";
    } else {
      nomeNaReceita = parsedInput.nomeNaReceita;
      status = nomesConferem(consulta.nomeInformado, nomeNaReceita)
        ? "CONFERE"
        : "NAO_CONFERE";
    }

    await db.transaction(async (tx) => {
      const jaConsultada = consulta.status !== "PENDENTE" && consulta.status !== "EM_ANDAMENTO";

      await tx
        .update(consultas)
        .set({
          status,
          nomeNaReceita,
          erroMensagem,
          consultadaEm: new Date(),
        })
        .where(eq(consultas.id, parsedInput.consultaId));

      if (!jaConsultada) {
        await tx
          .update(lotes)
          .set({
            consultadasCount: sql`${lotes.consultadasCount} + 1`,
            status: "EM_CONSULTA",
            updatedAt: new Date(),
          })
          .where(eq(lotes.id, parsedInput.loteId));
      }
    });

    return { status, nomeNaReceita, erroMensagem };
  });
