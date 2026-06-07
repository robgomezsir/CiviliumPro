import archiver from "archiver";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionDir = path.join(root, "apps", "extension");
const distDir = path.join(root, "dist");

const ARQUIVOS_STORE = [
  "manifest.json",
  "background.js",
  "bridge.js",
  "content_script.js",
  "config.defaults.js",
  "config.embedded.js",
  "options.html",
  "options.js",
];

function lerVersao() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(extensionDir, "manifest.json"), "utf8"),
  );
  return manifest.version;
}

function sanitizarManifest(conteudo) {
  const manifest = JSON.parse(conteudo);
  manifest.host_permissions = manifest.host_permissions.filter(
    (item) => !item.includes("localhost"),
  );
  manifest.content_scripts = manifest.content_scripts.map((script) => ({
    ...script,
    matches: script.matches.filter((item) => !item.includes("localhost")),
  }));
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function copiarParaStaging(pastaDestino) {
  fs.mkdirSync(pastaDestino, { recursive: true });

  for (const arquivo of ARQUIVOS_STORE) {
    const origem = path.join(extensionDir, arquivo);
    const destino = path.join(pastaDestino, arquivo);

    if (arquivo === "manifest.json") {
      const conteudo = fs.readFileSync(origem, "utf8");
      fs.writeFileSync(destino, sanitizarManifest(conteudo), "utf8");
      continue;
    }

    fs.copyFileSync(origem, destino);
  }

  fs.cpSync(
    path.join(extensionDir, "icons"),
    path.join(pastaDestino, "icons"),
    { recursive: true },
  );
}

function criarZip(origem, destinoZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destinoZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(archive.pointer()));
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(origem, false);
    archive.finalize();
  });
}

async function main() {
  const versao = lerVersao();
  const pastaStaging = path.join(distDir, "civilium-bridge-store");
  const zipPath = path.join(distDir, `civilium-bridge-store-v${versao}.zip`);

  const iconesObrigatorios = ["icon16.png", "icon48.png", "icon128.png"];
  for (const icone of iconesObrigatorios) {
    if (!fs.existsSync(path.join(extensionDir, "icons", icone))) {
      console.error(`✗ Ícone ausente: icons/${icone}`);
      console.error("  Execute: pnpm icons:extension");
      process.exit(1);
    }
  }

  fs.rmSync(pastaStaging, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  copiarParaStaging(pastaStaging);

  const bytes = await criarZip(pastaStaging, zipPath);
  const tamanhoKb = (bytes / 1024).toFixed(1);

  console.log(`✓ Pacote Chrome Web Store: ${zipPath} (${tamanhoKb} KB)`);
  console.log("  Sem segredos — usuário configura em Opções da extensão.");
  console.log("  Veja apps/extension/CHROME_WEB_STORE.md para o listing.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
