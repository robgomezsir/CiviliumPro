import archiver from "archiver";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionDir = path.join(root, "apps", "extension");
const distDir = path.join(root, "dist");
const guiaMd = path.join(extensionDir, "GUIA-INSTALACAO.md");
const guiaHtml = path.join(extensionDir, "GUIA-INSTALACAO.html");

const ARQUIVOS_EXTENSAO = [
  "manifest.json",
  "background.js",
  "bridge.js",
  "content_script.js",
  "config.js",
];

function lerVersao() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(extensionDir, "manifest.json"), "utf8"),
  );
  return manifest.version;
}

function validarArquivos() {
  const faltando = ARQUIVOS_EXTENSAO.filter(
    (arquivo) => !fs.existsSync(path.join(extensionDir, arquivo)),
  );

  if (faltando.length === 0) return;

  if (faltando.includes("config.js")) {
    console.error("✗ config.js não encontrado em apps/extension/");
    console.error("  Execute na raiz: pnpm setup:secrets");
    console.error("  Ou copie: cp apps/extension/config.example.js apps/extension/config.js");
    process.exit(1);
  }

  console.error(`✗ Arquivos ausentes: ${faltando.join(", ")}`);
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

function copiarParaStaging(pastaDestino, versao) {
  fs.mkdirSync(pastaDestino, { recursive: true });

  for (const arquivo of ARQUIVOS_EXTENSAO) {
    fs.copyFileSync(
      path.join(extensionDir, arquivo),
      path.join(pastaDestino, arquivo),
    );
  }

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
  validarArquivos();

  const versao = lerVersao();
  const nomePacote = `civilium-bridge-v${versao}`;
  const pastaPacote = path.join(distDir, nomePacote);
  const zipPath = path.join(distDir, `${nomePacote}.zip`);

  fs.rmSync(pastaPacote, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  copiarParaStaging(pastaPacote, versao);

  const bytes = await criarZip(pastaPacote, zipPath);
  const tamanhoKb = (bytes / 1024).toFixed(1);

  const guiaDistMd = path.join(distDir, "GUIA-INSTALACAO.md");
  const guiaDistHtml = path.join(distDir, "GUIA-INSTALACAO.html");

  if (fs.existsSync(guiaMd)) {
    copiarGuia(guiaMd, guiaDistMd, versao);
  }

  if (fs.existsSync(guiaHtml)) {
    copiarGuia(guiaHtml, guiaDistHtml, versao);
  }

  console.log(`✓ Pacote pronto: ${zipPath} (${tamanhoKb} KB)`);
  console.log(`✓ Pasta de instalação: ${pastaPacote}`);

  console.log("\nDistribua para a equipe:");
  console.log(`  • ${zipPath}`);
  if (fs.existsSync(guiaDistMd)) console.log(`  • ${guiaDistMd}`);
  if (fs.existsSync(guiaDistHtml)) {
    console.log(`  • ${guiaDistHtml}`);
    console.log("    PDF: abra o HTML no Chrome → Ctrl+P → Salvar como PDF");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
