import { NextRequest, NextResponse } from "next/server";
import { expirarConsultasInativas } from "@/lib/expirar-consultas";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ erro: "Cron não configurado" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const expiradas = await expirarConsultasInativas();
  return NextResponse.json({ ok: true, expiradas });
}
