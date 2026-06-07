import archiver from "archiver";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionDir = path.join(root, "apps", "extension");
const distDir = path.join(root, "dist");
const guiaMd = path.join(extensionDir, "GUIA-INSTALACAO.md");
const guiaHtml = path.join(extensionDir, "GUIA-INSTALACAO.html");

const ARQUIVOS_BASE = [
  "manifest.json",
  "background.js",
  "bridge.js",
  "content_script.js",
  "config.defaults.js",
  "config.embedded.js",
  "options.html",
  "options.js",
];

const PASTA_ICONES = "icons";

function lerVersao() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(extensionDir, "manifest.json"), "utf8"),
  );
  return manifest.version;
}

function lerConfigLocal() {
  const configPath = path.join(extensionDir, "config.js");
  if (!fs.existsSync(configPath)) return null;

  const conteudo = fs.readFileSync(configPath, "utf8");
  const apiBase =
    conteudo.match(/API_BASE:\s*"([^"]+)"/)?.[1] ??
    "https://civiliumpro.vercel.app";
  const webhookSecret = conteudo.match(/WEBHOOK_SECRET:\s*"([^"]+)"/)?.[1];

  if (!webhookSecret) return null;
  return { apiBase, webhookSecret };
}

function validarConfig() {
  const config = lerConfigLocal();
  if (config) return config;

  console.error("✗ config.js não encontrado ou sem WEBHOOK_SECRET");
  console.error("  Execute na raiz: pnpm setup:secrets");
  process.exit(1);
}

function aplicarVersao(conteudo, versao) {
  const nomePacote = `civilium-bridge-v${versao}`;
  return conteudo
    .replaceAll("{{VERSION}}", versao)
    .replaceAll("{{ZIP_NAME}}", `${nomePacote}.zip`)
    .replaceAll("{{FOLDER_NAME}}", nomePacote);
}

function copiarGuia(origem, destino, versao) {
  const conteudo = aplicarVersao(fs.readFileSync(origem, "utf8"), versao);
  fs.writeFileSync(destino, conteudo, "utf8");
}

function gerarEmbedded(config) {
  return `/** Gerado por pnpm pack:extension — não publicar na Chrome Web Store */\nvar CIVILIUM_EMBEDDED_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
}

function copiarIcones(pastaDestino) {
  const origem = path.join(extensionDir, PASTA_ICONES);
  const destino = path.join(pastaDestino, PASTA_ICONES);
  fs.cpSync(origem, destino, { recursive: true });
}

function copiarParaStaging(pastaDestino, versao, config) {
  fs.mkdirSync(pastaDestino, { recursive: true });

  for (const arquivo of ARQUIVOS_BASE) {
    if (arquivo === "config.embedded.js") continue;
    fs.copyFileSync(
      path.join(extensionDir, arquivo),
      path.join(pastaDestino, arquivo),
    );
  }

  fs.writeFileSync(
    path.join(pastaDestino, "config.embedded.js"),
    gerarEmbedded(config),
    "utf8",
  );

  copiarIcones(pastaDestino);

  if (fs.existsSync(guiaMd)) {
    copiarGuia(guiaMd, path.join(pastaDestino, "GUIA-INSTALACAO.md"), versao);
  }

  if (fs.existsSync(guiaHtml)) {
    copiarGuia(
      guiaHtml,
      path.join(pastaDestino, "GUIA-INSTALACAO.html"),
      versao,
    );
  }
}

function criarZip(origem, destinoZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destinoZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(archive.pointer()));
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(origem, path.basename(origem));
    archive.finalize();
  });
}

async function main() {
  const config = validarConfig();
  const versao = lerVersao();
  const nomePacote = `civilium-bridge-v${versao}`;
  const pastaPacote = path.join(distDir, nomePacote);
  const zipPath = path.join(distDir, `${nomePacote}.zip`);

  fs.rmSync(pastaPacote, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  copiarParaStaging(pastaPacote, versao, config);

  const bytes = await criarZip(pastaPacote, zipPath);
  const tamanhoKb = (bytes / 1024).toFixed(1);

  const guiaDistMd = path.join(distDir, "GUIA-INSTALACAO.md");
  const guiaDistHtml = path.join(distDir, "GUIA-INSTALACAO.html");

  if (fs.existsSync(guiaMd)) copiarGuia(guiaMd, guiaDistMd, versao);
  if (fs.existsSync(guiaHtml)) copiarGuia(guiaHtml, guiaDistHtml, versao);

  console.log(`✓ Pacote interno: ${zipPath} (${tamanhoKb} KB)`);
  console.log(`✓ Pasta: ${pastaPacote}`);
  console.log("\nDistribua para a equipe (segredo embutido no pacote).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
