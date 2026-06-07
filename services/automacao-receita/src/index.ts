import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import {
  abrirSessao,
  adicionarListener,
  enviarCaptcha,
  fecharSessao,
  iniciarConsulta,
  pausarSessao,
} from "./sessao-manager";

const app = new Hono();
const secret = process.env.AUTOMACAO_SECRET ?? "dev-secret";
const port = Number(process.env.PORT ?? 3100);

app.get("/health", (c) => c.json({ status: "ok" }));

app.use("/sessao/*", async (c, next) => {
  const auth = c.req.header("Authorization");
  if (auth !== `Bearer ${secret}`) {
    return c.json({ message: "Não autorizado" }, 401);
  }
  await next();
});

app.post("/sessao/:loteId/abrir", async (c) => {
  const loteId = c.req.param("loteId");
  await abrirSessao(loteId);
  return c.json({ ok: true });
});

app.post("/sessao/:loteId/consulta", async (c) => {
  const loteId = c.req.param("loteId");
  const body = await c.req.json<{
    cpf: string;
    dataNascimento: string;
    consultaId: string;
    nomeInformado?: string;
  }>();

  const resultado = await iniciarConsulta(loteId, body);
  return c.json(resultado);
});

app.post("/sessao/:loteId/captcha", async (c) => {
  const loteId = c.req.param("loteId");
  const body = await c.req.json<{ consultaId: string; captcha: string }>();
  const resultado = await enviarCaptcha(loteId, body);
  return c.json(resultado);
});

app.post("/sessao/:loteId/pausar", async (c) => {
  const loteId = c.req.param("loteId");
  await pausarSessao(loteId);
  return c.json({ ok: true });
});

app.delete("/sessao/:loteId", async (c) => {
  const loteId = c.req.param("loteId");
  await fecharSessao(loteId);
  return c.json({ ok: true });
});

app.get("/sessao/:loteId/eventos", (c) => {
  const loteId = c.req.param("loteId");

  return streamSSE(c, async (stream) => {
    const remove = adicionarListener(loteId, async (event, data) => {
      await stream.writeSSE({
        event,
        data: JSON.stringify(data),
      });
    });

    const heartbeat = setInterval(async () => {
      await stream.writeSSE({ event: "heartbeat", data: "{}" });
    }, 15_000);

    stream.onAbort(() => {
      clearInterval(heartbeat);
      remove?.();
    });

    await new Promise(() => undefined);
  });
});

serve({ fetch: app.fetch, port }, () => {
  console.log(`Automacao Receita rodando na porta ${port}`);
});
