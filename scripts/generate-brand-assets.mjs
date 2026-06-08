import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "apps", "web", "public");
const appDir = path.join(root, "apps", "web", "src", "app");
const extensionIconsDir = path.join(root, "apps", "extension", "icons");
const logoPath = path.join(root, "Civilium_logo.png");
const icoPath = path.join(root, "Civilium.ico");

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(extensionIconsDir, { recursive: true });

fs.copyFileSync(logoPath, path.join(publicDir, "civilium-logo.png"));
fs.copyFileSync(logoPath, path.join(root, "apps", "extension", "civilium-logo.png"));
fs.copyFileSync(icoPath, path.join(publicDir, "favicon.ico"));
fs.copyFileSync(icoPath, path.join(appDir, "favicon.ico"));

const tamanhosWeb = [
  { size: 32, name: "favicon-32.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
];

const sourceIcon = path.join(extensionIconsDir, "source.png");
if (!fs.existsSync(sourceIcon)) {
  const { execSync } = await import("node:child_process");
  execSync(
    'powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-ico.ps1',
    { cwd: root, stdio: "inherit" },
  );
}

for (const { size, name } of tamanhosWeb) {
  await sharp(fs.existsSync(sourceIcon) ? sourceIcon : logoPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, name));
  console.log(`✓ apps/web/public/${name}`);
}

const tamanhosExtensao = [16, 32, 48, 128];
for (const size of tamanhosExtensao) {
  await sharp(fs.existsSync(sourceIcon) ? sourceIcon : logoPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(extensionIconsDir, `icon${size}.png`));
  console.log(`✓ apps/extension/icons/icon${size}.png`);
}

await sharp(sourceIcon)
  .resize(128, 128, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(path.join(extensionIconsDir, "store-icon128.png"));

console.log("✓ apps/web/public/civilium-logo.png");
console.log("✓ apps/web/public/favicon.ico");
console.log("✓ apps/web/src/app/favicon.ico");
