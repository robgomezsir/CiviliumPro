import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = path.join(root, "apps", "extension", "icons");
const sourcePath = path.join(iconsDir, "source.png");
const icoPath = path.join(root, "Civilium.ico");
const tamanhos = [16, 32, 48, 128];

if (!fs.existsSync(sourcePath)) {
  if (!fs.existsSync(icoPath)) {
    console.error(`✗ Ícone não encontrado: ${icoPath}`);
    process.exit(1);
  }
  console.error("✗ Execute primeiro: powershell scripts/extract-ico.ps1");
  process.exit(1);
}

fs.mkdirSync(iconsDir, { recursive: true });

for (const size of tamanhos) {
  const destino = path.join(iconsDir, `icon${size}.png`);
  await sharp(sourcePath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(destino);
  console.log(`✓ ${destino}`);
}

const storeAsset = path.join(iconsDir, "store-icon128.png");
await sharp(sourcePath)
  .resize(128, 128, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(storeAsset);
console.log(`✓ ${storeAsset}`);
