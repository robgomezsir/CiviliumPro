import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import { RECEITA_URL, seletores } from "./receita-seletores";

type ConsultaPendente = {
  consultaId: string;
  cpf: string;
  dataNascimento: string;
  nomeInformado?: string;
};

type Sessao = {
  loteId: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  consultaAtual: ConsultaPendente | null;
  captchaImage: string | null;
  listeners: Set<(event: string, data: unknown) => void>;
  idleTimer: ReturnType<typeof setTimeout> | null;
};

const sessoes = new Map<string, Sessao>();
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const isMock = process.env.RECEITA_MOCK === "true";

function emit(sessao: Sessao, event: string, data: unknown) {
  for (const listener of sessao.listeners) {
    listener(event, data);
  }
}

function resetIdleTimer(sessao: Sessao) {
  if (sessao.idleTimer) clearTimeout(sessao.idleTimer);
  sessao.idleTimer = setTimeout(() => {
    void fecharSessao(sessao.loteId);
  }, IDLE_TIMEOUT_MS);
}

export async function abrirSessao(loteId: string) {
  if (sessoes.has(loteId)) {
    const existente = sessoes.get(loteId)!;
    resetIdleTimer(existente);
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  if (!isMock) {
    await page.goto(RECEITA_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  }

  const sessao: Sessao = {
    loteId,
    browser,
    context,
    page,
    consultaAtual: null,
    captchaImage: null,
    listeners: new Set(),
    idleTimer: null,
  };

  sessoes.set(loteId, sessao);
  resetIdleTimer(sessao);
}

export async function iniciarConsulta(
  loteId: string,
  payload: ConsultaPendente,
): Promise<{ captchaImage: string; consultaId: string }> {
  const sessao = sessoes.get(loteId);
  if (!sessao) throw new Error("Sessão não encontrada");

  resetIdleTimer(sessao);
  sessao.consultaAtual = payload;

  if (isMock) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="#e2e8f0"/><text x="20" y="38" font-size="24" fill="#334155">ABC123</text></svg>`;
    const captchaImage = Buffer.from(svg).toString("base64");
    sessao.captchaImage = captchaImage;
    emit(sessao, "captcha_ready", { consultaId: payload.consultaId, captchaImage });
    return { captchaImage, consultaId: payload.consultaId };
  }

  const { page } = sessao;

  if (page.url() !== RECEITA_URL) {
    await page.goto(RECEITA_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  }

  await page.fill(seletores.cpf, payload.cpf);
  await page.fill(seletores.dataNascimento, payload.dataNascimento);

  const captchaElement = page.locator(seletores.captchaImage);
  await captchaElement.waitFor({ state: "visible", timeout: 30_000 });
  const captchaBuffer = await captchaElement.screenshot();
  const captchaImage = captchaBuffer.toString("base64");

  sessao.captchaImage = captchaImage;
  emit(sessao, "captcha_ready", { consultaId: payload.consultaId, captchaImage });

  return { captchaImage, consultaId: payload.consultaId };
}

export async function enviarCaptcha(
  loteId: string,
  payload: { consultaId: string; captcha: string },
): Promise<{ nomeNaReceita?: string; erroMensagem?: string }> {
  const sessao = sessoes.get(loteId);
  if (!sessao || !sessao.consultaAtual) {
    throw new Error("Nenhuma consulta em andamento");
  }

  resetIdleTimer(sessao);

  if (isMock) {
    const nomeNaReceita =
      payload.captcha.toUpperCase() === "ABC123"
        ? sessao.consultaAtual.nomeInformado ?? "NOME MOCK RECEITA"
        : undefined;

    if (!nomeNaReceita) {
      const erroMensagem = "CAPTCHA incorreto. Tente novamente.";
      emit(sessao, "erro", { consultaId: payload.consultaId, erroMensagem });
      sessao.consultaAtual = null;
      sessao.captchaImage = null;
      return { erroMensagem };
    }

    emit(sessao, "consulta_concluida", {
      consultaId: payload.consultaId,
      nomeNaReceita,
    });
    sessao.consultaAtual = null;
    sessao.captchaImage = null;
    return { nomeNaReceita };
  }

  const { page } = sessao;

  await page.fill(seletores.captchaInput, payload.captcha);
  await page.click(seletores.botaoConsultar);
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => null);

  const erroLocator = page.locator(seletores.mensagemErro);
  if (await erroLocator.isVisible().catch(() => false)) {
    const erroMensagem =
      (await erroLocator.textContent())?.trim() ||
      "Não foi possível consultar o CPF na Receita Federal";
    emit(sessao, "erro", { consultaId: payload.consultaId, erroMensagem });
    sessao.consultaAtual = null;
    sessao.captchaImage = null;
    return { erroMensagem };
  }

  const nomeLocator = page.locator(seletores.nomeResultado);
  const nomeNaReceita = (await nomeLocator.first().textContent())?.trim();

  if (!nomeNaReceita) {
    const erroMensagem = "O CPF informado não foi encontrado na Receita Federal";
    emit(sessao, "erro", { consultaId: payload.consultaId, erroMensagem });
    sessao.consultaAtual = null;
    sessao.captchaImage = null;
    return { erroMensagem };
  }

  emit(sessao, "consulta_concluida", {
    consultaId: payload.consultaId,
    nomeNaReceita,
  });

  sessao.consultaAtual = null;
  sessao.captchaImage = null;

  await page.goto(RECEITA_URL, { waitUntil: "domcontentloaded", timeout: 60_000 }).catch(
    () => null,
  );

  return { nomeNaReceita };
}

export function adicionarListener(
  loteId: string,
  listener: (event: string, data: unknown) => void,
) {
  const sessao = sessoes.get(loteId);
  if (!sessao) return () => undefined;
  sessao.listeners.add(listener);
  return () => sessao.listeners.delete(listener);
}

export async function pausarSessao(loteId: string) {
  const sessao = sessoes.get(loteId);
  if (sessao) resetIdleTimer(sessao);
}

export async function fecharSessao(loteId: string) {
  const sessao = sessoes.get(loteId);
  if (!sessao) return;
  if (sessao.idleTimer) clearTimeout(sessao.idleTimer);
  sessao.listeners.clear();
  await sessao.context.close().catch(() => null);
  await sessao.browser.close().catch(() => null);
  sessoes.delete(loteId);
}
