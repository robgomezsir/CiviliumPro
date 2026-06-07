import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultas, lotes } from "@/db/schema";
import { resolverStatusConsulta } from "@/lib/consulta-resultado";

type ResultadoBody = {
  consultaId: string;
  loteId?: string;
  tokenConsulta: string;
  correlationId?: string;
  status: string;
  nomeReceita?: string;
  situacaoCadastral?: string;
  mensagemErro?: string;
};

export async function POST(req: NextRequest) {
  const secret = process.env.CIVILIUM_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { erro: "Webhook não configurado" },
      { status: 503 },
    );
  }

  if (req.headers.get("x-civilium-secret") !== secret) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: ResultadoBody;
  try {
    body = (await req.json()) as ResultadoBody;
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  if (!body.consultaId || !body.tokenConsulta || !body.status) {
    return NextResponse.json({ erro: "Payload incompleto" }, { status: 400 });
  }

  const [consulta] = await db
    .select()
    .from(consultas)
    .where(eq(consultas.id, body.consultaId))
    .limit(1);

  if (!consulta) {
    return NextResponse.json({ erro: "Consulta não encontrada" }, { status: 404 });
  }

  if (consulta.tokenConsulta !== body.tokenConsulta) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  if (consulta.resultadoRecebidoEm) {
    return NextResponse.json({ ok: true, duplicado: true });
  }

  const resolvido = resolverStatusConsulta(consulta.nomeInformado, {
    status: body.status,
    nomeReceita: body.nomeReceita,
    mensagemErro: body.mensagemErro,
  });

  const agora = new Date();
  const jaContabilizada =
    consulta.status !== "PENDENTE" && consulta.status !== "EM_ANDAMENTO";

  await db.transaction(async (tx) => {
    const atualizado = await tx
      .update(consultas)
      .set({
        status: resolvido.status,
        nomeNaReceita: resolvido.nomeNaReceita,
        situacaoCadastral: resolvido.situacaoCadastral,
        erroMensagem: resolvido.erroMensagem,
        resultadoRecebidoEm: agora,
        consultadaEm: agora,
      })
      .where(
        and(
          eq(consultas.id, body.consultaId),
          isNull(consultas.resultadoRecebidoEm),
        ),
      )
      .returning({ id: consultas.id });

    if (!atualizado.length || jaContabilizada) return;

    await tx
      .update(lotes)
      .set({
        consultadasCount: sql`${lotes.consultadasCount} + 1`,
        status: "EM_CONSULTA",
        updatedAt: agora,
      })
      .where(eq(lotes.id, consulta.loteId));
  });

  return NextResponse.json({ ok: true });
}
