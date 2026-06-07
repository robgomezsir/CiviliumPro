import crypto from "node:crypto";
import { consultaPodeRetentar } from "@civilium/shared";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { consultas, lotes } from "@/db/schema";
import { montarUrlReceita } from "@/lib/receita-url";

export type PayloadConsulta = {
  consultaId: string;
  loteId: string;
  correlationId: string;
  tokenConsulta: string;
  url: string;
  ordemNaLista: number;
  nomeInformado: string;
};

export async function prepararConsulta(
  consultaId: string,
  loteId: string,
): Promise<PayloadConsulta> {
  const [consulta] = await db
    .select()
    .from(consultas)
    .where(and(eq(consultas.id, consultaId), eq(consultas.loteId, loteId)))
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
      .where(eq(consultas.id, consultaId));
  });

  return {
    consultaId,
    loteId: consulta.loteId,
    correlationId,
    tokenConsulta,
    url: montarUrlReceita(consulta.cpf, consulta.dataNascimento),
    ordemNaLista: consulta.ordemNaLista,
    nomeInformado: consulta.nomeInformado,
  };
}
