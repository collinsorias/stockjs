// Verifies that `.env.example` documents every environment variable the app
// actually reads. Run with `npm test`.
//
// Sources of truth gathered here:
//   1. literal `process.env.FOO` reads in src/**/*.{ ts,tsx }
//   2. `env("FOO")` references in prisma/schema.prisma
//
// `NODE_ENV` and other values the Next.js/Node runtime owns are ignored, as
// are variables that are only read through a dynamic key.

import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Provided by the runtime, never configured in .env files.
const RUNTIME_OWNED = new Set(["NODE_ENV"]);

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(full)));
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }

  return files;
}

function collectMatches(text, pattern) {
  const found = new Set();

  for (const match of text.matchAll(pattern)) {
    found.add(match[1]);
  }

  return found;
}

/** Keys declared in `.env.example` (`KEY=value` lines). */
export async function parseEnvExampleKeys() {
  const text = await readFile(join(ROOT, ".env.example"), "utf8");
  const keys = new Set();

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(trimmed);
    if (match) keys.add(match[1]);
  }

  return keys;
}

/** Keys read via `process.env.FOO` anywhere under src/. */
export async function collectAppEnvKeys() {
  const files = await listSourceFiles(join(ROOT, "src"));
  const keys = new Set();

  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const key of collectMatches(text, /process\.env\.([A-Z_][A-Z0-9_]*)/g)) {
      if (!RUNTIME_OWNED.has(key)) keys.add(key);
    }
  }

  return keys;
}

/** Keys referenced by `env("FOO")` in prisma/schema.prisma. */
export async function collectPrismaEnvKeys() {
  const text = await readFile(join(ROOT, "prisma", "schema.prisma"), "utf8");
  const keys = collectMatches(text, /\benv\(\s*"([A-Z_][A-Z0-9_]*)"\s*\)/g);

  for (const key of RUNTIME_OWNED) keys.delete(key);
  return keys;
}

export async function collectRequiredEnvKeys() {
  const [appKeys, prismaKeys] = await Promise.all([
    collectAppEnvKeys(),
    collectPrismaEnvKeys(),
  ]);

  return new Set([...appKeys, ...prismaKeys]);
}

async function main() {
  const documented = await parseEnvExampleKeys();
  const required = await collectRequiredEnvKeys();

  const missing = [...required].filter((key) => !documented.has(key)).sort();
  const unused = [...documented].filter((key) => !required.has(key)).sort();

  if (missing.length > 0) {
    console.error(
      `FAIL: ${missing.length} env var(s) are read by the app but absent from .env.example:`,
    );
    for (const key of missing) console.error(`  - ${key}`);
  }

  if (unused.length > 0) {
    // Not fatal: templates may legitimately carry forward-looking entries.
    console.warn(
      `WARN: ${unused.length} var(s) in .env.example are not read anywhere: ${unused.join(", ")}`,
    );
  }

  if (missing.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(
    `OK: .env.example documents all ${required.size} env var(s) the app reads.`,
  );
}

const invokedPath = process.argv[1] ? relative(process.cwd(), process.argv[1]) : "";
if (invokedPath.endsWith(join("scripts", "test-env-example.mjs"))) {
  await main();
}