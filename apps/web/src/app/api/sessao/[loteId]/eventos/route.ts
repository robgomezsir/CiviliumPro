import { checkRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ loteId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { loteId } = await params;

  if (!checkRateLimit(`sse-${loteId}`, 5, 60_000)) {
    return new Response("Muitas conexões. Aguarde.", { status: 429 });
  }

  const baseUrl = process.env.AUTOMACAO_RECEITA_URL ?? "http://localhost:3100";
  const secret = process.env.AUTOMACAO_RECEITA_SECRET ?? "dev-secret";

  const upstream = await fetch(`${baseUrl}/sessao/${loteId}/eventos`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "text/event-stream",
    },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Não foi possível conectar ao serviço de consulta", {
      status: 502,
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
