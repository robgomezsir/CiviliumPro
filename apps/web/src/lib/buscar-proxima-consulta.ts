import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultas } from "@/db/schema";

export async function buscarProximaConsultaPendente(
  loteId: string,
  consultaIdAtual: string,
) {
  const fila = await db
    .select()
    .from(consultas)
    .where(eq(consultas.loteId, loteId))
    .orderBy(asc(consultas.ordemNaLista));

  const indiceAtual = fila.findIndex((c) => c.id === consultaIdAtual);
  if (indiceAtual === -1) return null;

  for (let i = indiceAtual + 1; i < fila.length; i++) {
    if (fila[i].status === "PENDENTE") {
      return fila[i];
    }
  }

  return null;
}
