import fs from "node:fs";

const file = process.argv[2] ?? ".env.vercel.prod";
const line = fs
  .readFileSync(file, "utf8")
  .split("\n")
  .find((l) => l.startsWith("DATABASE_URL="));

if (!line) {
  console.log("DATABASE_URL missing");
  process.exit(1);
}

const raw = line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
try {
  const u = new URL(raw);
  console.log(JSON.stringify({
    hostname: u.hostname,
    port: u.port,
    username: u.username,
    pathname: u.pathname,
    hasPassword: Boolean(u.password),
  }, null, 2));
} catch (error) {
  console.log("parse error:", error.message);
}
