import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, "apps", "web", ".env.local");
const configPath = path.join(root, "apps", "extension", "config.js");

function gerarSecret() {
  return crypto.randomBytes(32).toString("hex");
}

function lerEnv(caminho) {
  if (!fs.existsSync(caminho)) return "";
  return fs.readFileSync(caminho, "utf8");
}

function temChave(conteudo, chave) {
  return new RegExp(`^${chave}=`, "m").test(conteudo);
}

function anexarChave(conteudo, chave, valor) {
  const linha = `${chave}=${valor}`;
  return conteudo.endsWith("\n") || conteudo.length === 0
    ? `${conteudo}${linha}\n`
    : `${conteudo}\n${linha}\n`;
}

const webhook = gerarSecret();
const cron = gerarSecret();

let env = lerEnv(envPath);
let alterouEnv = false;

if (!temChave(env, "CIVILIUM_WEBHOOK_SECRET")) {
  env = anexarChave(env, "CIVILIUM_WEBHOOK_SECRET", webhook);
  alterouEnv = true;
}

if (!temChave(env, "CRON_SECRET")) {
  env = anexarChave(env, "CRON_SECRET", cron);
  alterouEnv = true;
}

if (alterouEnv) {
  fs.writeFileSync(envPath, env, "utf8");
  console.log(`✓ Segredos adicionados em apps/web/.env.local`);
} else {
  console.log("• apps/web/.env.local já contém os segredos v2.2");
}

const configAtual = fs.readFileSync(configPath, "utf8");
const secretNoEnv =
  env.match(/^CIVILIUM_WEBHOOK_SECRET=(.+)$/m)?.[1]?.trim() ?? webhook;

const configNovo = configAtual.replace(
  /WEBHOOK_SECRET:\s*"[^"]*"/,
  `WEBHOOK_SECRET: "${secretNoEnv}"`,
);

if (configNovo !== configAtual) {
  fs.writeFileSync(configPath, configNovo, "utf8");
  console.log("✓ apps/extension/config.js sincronizado com WEBHOOK_SECRET");
} else {
  console.log("• apps/extension/config.js já está sincronizado");
}

console.log("\nConfigure os mesmos valores na Vercel:");
console.log("  CIVILIUM_WEBHOOK_SECRET");
console.log("  CRON_SECRET");
