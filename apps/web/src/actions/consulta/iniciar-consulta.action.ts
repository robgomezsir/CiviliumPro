"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultas } from "@/db/schema";
import {
  abrirSessaoAutomacao,
  iniciarConsultaAutomacao,
} from "@/lib/automacao/sessao";
import { checkRateLimit } from "@/lib/rate-limit";
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

    if (!consulta) throw new Error("Pessoa não encontrada no lote");

    if (consulta.status !== "PENDENTE" && consulta.status !== "EM_ANDAMENTO") {
      throw new Error("Esta pessoa já foi verificada");
    }

    await abrirSessaoAutomacao(parsedInput.loteId);

    await db
      .update(consultas)
      .set({ status: "EM_ANDAMENTO" })
      .where(eq(consultas.id, parsedInput.consultaId));

    const resultado = await iniciarConsultaAutomacao(parsedInput.loteId, {
      loteId: parsedInput.loteId,
      cpf: consulta.cpf,
      dataNascimento: consulta.dataNascimento,
      consultaId: consulta.id,
      nomeInformado: consulta.nomeInformado,
    });

    return resultado;
  });
