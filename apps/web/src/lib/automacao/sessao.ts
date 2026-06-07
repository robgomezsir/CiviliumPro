import { and, eq, lt } from "drizzle-orm";
import type { BrowserContextOptions } from "playwright-core";
import { db } from "@/db";
import { sessoesAutomacao } from "@/db/schema";
import { launchBrowser } from "./browser";
import { RECEITA_URL, seletores } from "./receita-seletores";

const SESSAO_TTL_MS = 10 * 60 * 1000;
const isMock = process.env.RECEITA_MOCK === "true";

type ConsultaPayload = {
  consultaId: string;
  loteId: string;
  cpf: string;
  dataNascimento: string;
  nomeInformado?: string;
};

function mockCaptchaImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="#e2e8f0"/><text x="20" y="38" font-size="24" fill="#334155">ABC123</text></svg>`;
  return Buffer.from(svg).toString("base64");
}

async function limparSessoesExpiradas() {
  await db
    .delete(sessoesAutomacao)
    .where(lt(sessoesAutomacao.expiresAt, new Date()));
}

export async function abrirSessaoAutomacao(_loteId: string) {
  await limparSessoesExpiradas();
}

export async function iniciarConsultaAutomacao(
  loteId: string,
  payload: ConsultaPayload,
): Promise<{ captchaImage: string; consultaId: string }> {
  await limparSessoesExpiradas();

  await db
    .delete(sessoesAutomacao)
    .where(eq(sessoesAutomacao.consultaId, payload.consultaId));

  if (isMock) {
    const captchaImage = mockCaptchaImage();
    await db.insert(sessoesAutomacao).values({
      loteId,
      consultaId: payload.consultaId,
      storageState: { mock: true },
      cpf: payload.cpf,
      dataNascimento: payload.dataNascimento,
      nomeInformado: payload.nomeInformado,
      expiresAt: new Date(Date.now() + SESSAO_TTL_MS),
    });
    return { captchaImage, consultaId: payload.consultaId };
  }

  const browser = await launchBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(RECEITA_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.fill(seletores.cpf, payload.cpf);
    await page.fill(seletores.dataNascimento, payload.dataNascimento);

    const captchaElement = page.locator(seletores.captchaImage);
    await captchaElement.waitFor({ state: "visible", timeout: 30_000 });
    const captchaBuffer = await captchaElement.screenshot();
    const captchaImage = captchaBuffer.toString("base64");
    const storageState = await context.storageState();

    await db.insert(sessoesAutomacao).values({
      loteId,
      consultaId: payload.consultaId,
      storageState,
      cpf: payload.cpf,
      dataNascimento: payload.dataNascimento,
      nomeInformado: payload.nomeInformado,
      expiresAt: new Date(Date.now() + SESSAO_TTL_MS),
    });

    return { captchaImage, consultaId: payload.consultaId };
  } finally {
    await context.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

export async function enviarCaptchaAutomacao(
  loteId: string,
  payload: { consultaId: string; captcha: string },
): Promise<{ nomeNaReceita?: string; erroMensagem?: string }> {
  const [sessao] = await db
    .select()
    .from(sessoesAutomacao)
    .where(
      and(
        eq(sessoesAutomacao.consultaId, payload.consultaId),
        eq(sessoesAutomacao.loteId, loteId),
      ),
    )
    .limit(1);

  if (!sessao) {
    throw new Error("Sessão de consulta expirada. Inicie a verificação novamente.");
  }

  if (sessao.expiresAt < new Date()) {
    await db
      .delete(sessoesAutomacao)
      .where(eq(sessoesAutomacao.consultaId, payload.consultaId));
    throw new Error("Sessão de consulta expirada. Inicie a verificação novamente.");
  }

  if (isMock) {
    const nomeNaReceita =
      payload.captcha.toUpperCase() === "ABC123"
        ? sessao.nomeInformado ?? "NOME MOCK RECEITA"
        : undefined;

    await db
      .delete(sessoesAutomacao)
      .where(eq(sessoesAutomacao.consultaId, payload.consultaId));

    if (!nomeNaReceita) {
      return { erroMensagem: "CAPTCHA incorreto. Tente novamente." };
    }

    return { nomeNaReceita };
  }

  const browser = await launchBrowser();
  const context = await browser.newContext({
    storageState: sessao.storageState as BrowserContextOptions["storageState"],
  });
  const page = await context.newPage();

  try {
    await page.goto(RECEITA_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.fill(seletores.captchaInput, payload.captcha);
    await page.click(seletores.botaoConsultar);
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => null);

    const erroLocator = page.locator(seletores.mensagemErro);
    if (await erroLocator.isVisible().catch(() => false)) {
      const erroMensagem =
        (await erroLocator.textContent())?.trim() ||
        "Não foi possível consultar o CPF na Receita Federal";
      return { erroMensagem };
    }

    const nomeLocator = page.locator(seletores.nomeResultado);
    const nomeNaReceita = (await nomeLocator.first().textContent())?.trim();

    if (!nomeNaReceita) {
      return {
        erroMensagem: "O CPF informado não foi encontrado na Receita Federal",
      };
    }

    return { nomeNaReceita };
  } finally {
    await db
      .delete(sessoesAutomacao)
      .where(eq(sessoesAutomacao.consultaId, payload.consultaId));
    await context.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

export async function pausarSessaoAutomacao(_loteId: string) {
  await limparSessoesExpiradas();
}

export async function fecharSessaoAutomacao(loteId: string) {
  await db.delete(sessoesAutomacao).where(eq(sessoesAutomacao.loteId, loteId));
}
