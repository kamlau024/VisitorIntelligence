// Environment check for the demo-pdf skill. Run this before a prospect run
// (or right after install) so failures surface here rather than halfway
// through a render. Exits 0 only when every required check passes.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";

const run = promisify(execFile);
const SKILL_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const results = [];
const ok = (name, detail) => results.push({ name, state: "ok", detail });
const warn = (name, detail, fix) => results.push({ name, state: "warn", detail, fix });
const fail = (name, detail, fix) => results.push({ name, state: "fail", detail, fix });

// 1. Node version — 18 is the floor (global fetch, stable ESM).
const major = Number(process.versions.node.split(".")[0]);
if (major >= 18) ok("Node.js", `v${process.versions.node}`);
else fail("Node.js", `v${process.versions.node} is too old`, "Install Node.js 18 or newer (22+ recommended).");

// 2 & 3. Dependencies must resolve FROM THIS SCRIPT's location, so the skill
// works installed anywhere — not just inside a repo that happens to have them.
let playwrightOk = false;
try {
  const { chromium } = await import("playwright");
  playwrightOk = Boolean(chromium);
  ok("playwright", "resolved");
} catch {
  fail("playwright", "not installed", `Run: cd "${SKILL_DIR}" && npm install`);
}

try {
  await import("pdf-lib");
  ok("pdf-lib", "resolved");
} catch {
  fail("pdf-lib", "not installed", `Run: cd "${SKILL_DIR}" && npm install`);
}

// 4. The Chromium binary is a separate download from the npm package.
if (playwrightOk) {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const version = browser.version();
    await browser.close();
    ok("Chromium", `launches (${version})`);
  } catch (err) {
    fail(
      "Chromium",
      `cannot launch: ${String(err).split("\n")[0]}`,
      `Run: cd "${SKILL_DIR}" && npx playwright install chromium`
    );
  }
}

// 5. poppler powers PDF reading during the QA step. Not needed to RENDER,
// so a warning rather than a failure — but QA cannot be done without it.
const POPPLER_FALLBACKS = ["/opt/homebrew/bin/pdftoppm", "/usr/local/bin/pdftoppm"];
try {
  await run("pdftoppm", ["-v"]);
  ok("pdftoppm (poppler)", "on PATH");
} catch {
  let found = null;
  for (const candidate of POPPLER_FALLBACKS) {
    try {
      await run(candidate, ["-v"]);
      found = candidate;
      break;
    } catch {
      /* keep looking */
    }
  }
  if (found) {
    warn(
      "pdftoppm (poppler)",
      `installed at ${found} but not on PATH`,
      `Add its directory to PATH, or invoke it by full path: ${found}`
    );
  } else {
    warn(
      "pdftoppm (poppler)",
      "missing — the agent cannot read the rendered PDF for the step 6 QA pass",
      "macOS: brew install poppler · Debian/Ubuntu: apt-get install poppler-utils"
    );
  }
}

// 6. SKILL.md frontmatter must satisfy the Claude upload validator. Local
// runs tolerate anything, but angle brackets in the description are read as
// XML tags and the upload is rejected — so this is a warning, checked here
// rather than discovered in the upload dialog.
try {
  const skillMd = readFileSync(path.join(SKILL_DIR, "SKILL.md"), "utf8");
  const fm = /^---\n(.*?)\n---\n/s.exec(skillMd);
  if (!fm) {
    warn("SKILL.md frontmatter", "no YAML frontmatter block found", "Add a --- delimited block with name and description.");
  } else {
    const name = /^name:\s*(.+)$/m.exec(fm[1])?.[1].trim() ?? "";
    const desc = /^description:\s*(.+)$/m.exec(fm[1])?.[1].trim() ?? "";
    const problems = [];
    if (!/^[a-z0-9-]+$/.test(name)) problems.push(`name "${name}" must be lowercase letters, numbers, and hyphens only`);
    if (!desc) problems.push("description is empty");
    if (desc.length > 1024) problems.push(`description is ${desc.length} chars (limit 1024)`);
    if (/[<>]/.test(desc)) problems.push("description contains < or > — the upload validator rejects these as XML tags");
    if (problems.length === 0) ok("SKILL.md frontmatter", `name "${name}", description ${desc.length} chars`);
    else warn("SKILL.md frontmatter", problems.join("; "), "Fix before uploading the skill to a Claude account (local runs are unaffected).");
  }
} catch (err) {
  warn("SKILL.md frontmatter", `could not read SKILL.md: ${String(err).split("\n")[0]}`);
}

const icon = { ok: "✓", warn: "!", fail: "✗" };
console.log(`\ndemo-pdf preflight — skill at ${SKILL_DIR}\n`);
for (const r of results) {
  console.log(`  ${icon[r.state]} ${r.name.padEnd(20)} ${r.detail}`);
  if (r.fix) console.log(`      → ${r.fix}`);
}

const failures = results.filter((r) => r.state === "fail").length;
const warnings = results.filter((r) => r.state === "warn").length;
console.log(
  failures === 0
    ? `\nReady${warnings ? ` (${warnings} warning${warnings > 1 ? "s" : ""})` : ""}.\n`
    : `\n${failures} blocking problem${failures > 1 ? "s" : ""} — fix the above before running the skill.\n`
);
process.exit(failures === 0 ? 0 : 1);
