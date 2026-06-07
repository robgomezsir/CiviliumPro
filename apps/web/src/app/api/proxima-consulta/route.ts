import { NextRequest, NextResponse } from "next/server";
import { buscarProximaConsultaPendente } from "@/lib/buscar-proxima-consulta";
import { prepararConsulta } from "@/lib/preparar-consulta";

type Body = {
  loteId: string;
  consultaIdAtual: string;
  repetir?: boolean;
};

export async function POST(req: NextRequest) {
  const secret = process.env.CIVILIUM_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ erro: "API não configurada" }, { status: 503 });
  }

  if (req.headers.get("x-civilium-secret") !== secret) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  if (!body.loteId || !body.consultaIdAtual) {
    return NextResponse.json({ erro: "Payload incompleto" }, { status: 400 });
  }

  try {
    if (body.repetir) {
      const payload = await prepararConsulta(
        body.consultaIdAtual,
        body.loteId,
      );
      return NextResponse.json({ ok: true, ...payload });
    }

    const proxima = await buscarProximaConsultaPendente(
      body.loteId,
      body.consultaIdAtual,
    );

    if (!proxima) {
      return NextResponse.json({ ok: true, fim: true });
    }

    const payload = await prepararConsulta(proxima.id, body.loteId);
    return NextResponse.json({ ok: true, ...payload });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao preparar consulta";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }
}
