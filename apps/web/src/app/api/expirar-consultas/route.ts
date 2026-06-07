import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultas, lotes } from "@/db/schema";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ erro: "Cron não configurado" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const limite = new Date(Date.now() - 5 * 60 * 1000);
  const agora = new Date();

  const expiradas = await db
    .select({ id: consultas.id, loteId: consultas.loteId })
    .from(consultas)
    .where(
      and(
        eq(consultas.status, "EM_ANDAMENTO"),
        lt(consultas.abaAbertaEm, limite),
        isNull(consultas.resultadoRecebidoEm),
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

  return NextResponse.json({ ok: true, expiradas: expiradas.length });
}
