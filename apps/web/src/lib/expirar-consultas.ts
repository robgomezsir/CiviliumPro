import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { consultas, lotes } from "@/db/schema";

const TIMEOUT_MS = 5 * 60 * 1000;

export async function expirarConsultasInativas(loteId?: string) {
  const limite = new Date(Date.now() - TIMEOUT_MS);
  const agora = new Date();

  const expiradas = await db
    .select({ id: consultas.id, loteId: consultas.loteId })
    .from(consultas)
    .where(
      and(
        eq(consultas.status, "EM_ANDAMENTO"),
        lt(consultas.abaAbertaEm, limite),
        isNull(consultas.resultadoRecebidoEm),
        loteId ? eq(consultas.loteId, loteId) : undefined,
      ),
    );

  for (const row of expiradas) {
    await db.transaction(async (tx) => {
      const atualizado = await tx
        .update(consultas)
        .set({
          status: "EXPIRADO",
          erroMensagem: "Consulta expirada por inatividade",
          resultadoRecebidoEm: agora,
          consultadaEm: agora,
        })
        .where(
          and(
            eq(consultas.id, row.id),
            eq(consultas.status, "EM_ANDAMENTO"),
            isNull(consultas.resultadoRecebidoEm),
          ),
        )
        .returning({ id: consultas.id });

      if (!atualizado.length) return;

      await tx
        .update(lotes)
        .set({
          consultadasCount: sql`${lotes.consultadasCount} + 1`,
          updatedAt: agora,
        })
        .where(eq(lotes.id, row.loteId));
    });
  }

  return expiradas.length;
}
