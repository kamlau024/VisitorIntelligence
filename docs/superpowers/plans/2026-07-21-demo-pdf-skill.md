# demo-pdf Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a project skill at `.claude/skills/demo-pdf/` that turns a prospect folder (3 CSVs + author name) into a 3-page sales PDF, and validate it by generating `demo_pdf/example-prospect/demo.pdf`.

**Architecture:** Standalone HTML templates (warm print palette from the approved page3 wireframe) filled by the executing agent, plus four deterministic Node scripts: tolerant CSV→JSON conversion, source-URL verification, Playwright homepage screenshot, and Playwright HTML→tall-PDF rendering merged with pdf-lib. Spec: `docs/superpowers/specs/2026-07-21-demo-pdf-skill-design.md`.

**Tech Stack:** Node 24 (ESM `.mjs`, built-in `node --test`, global `fetch`), `playwright@1.61.1` (Chromium already cached in `~/Library/Caches/ms-playwright`), `pdf-lib`. No Python — the machine has no Python playwright/pypdf; the spec's `.py` script names are amended to `.mjs` in Task 1.

## Global Constraints

- All commands run from the repo root: `/Users/kamlau/Projects/VisitorIntelligence`.
- Cluster labels render **verbatim** from CSV `cluster_name` values — never renamed, retitled, or case-changed.
- Every `http(s)` URL found in the CSVs must be verified live before rendering; any failure aborts the run. Nothing fabricated ships.
- Page 2 volumes/trends always render as literal `X` / `XX%` — never invented numbers.
- PDF pages are 8.5 in wide (816 CSS px at 96 dpi), content-determined height, zero margins; `body { width: 816px }` in every template.
- All pages share `templates/tokens.css` (palette lifted from `demo_pdf/example-prospect/page3_wireframe.html`; widget accent terracotta `#C2552F`).
- The example CSVs contain mixed UTF-8/cp1252 bytes; all CSV reads go through `csv_to_json.mjs`. Rendered output must contain no U+FFFD (`�`) characters.
- Story discipline: no affiliate chip, no draft scaffold, no "Write it for me," no credits meter, no stat/summary boxes, no "Intent by [type]" section, no app left-nav, no trend badges, no "New" pills, no CTAs on the gap card.
- Test command for skill scripts: `node --test .claude/skills/demo-pdf/tests/`.
- Commit after every task with the trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Toolchain setup + spec amendment

**Files:**
- Modify: `package.json` (devDependencies via npm)
- Modify: `docs/superpowers/specs/2026-07-21-demo-pdf-skill-design.md` (script names `.py` → `.mjs`)
- Modify: `.gitignore` (ignore prospect build dirs)

**Interfaces:**
- Consumes: nothing.
- Produces: `import { chromium } from "playwright"` and `import { PDFDocument } from "pdf-lib"` resolvable from repo root; Chromium launchable headless. All later tasks depend on this.

- [ ] **Step 1: Install dev dependencies**

Run: `npm install -D playwright@1.61.1 pdf-lib`
Expected: both packages added to `devDependencies`, exit 0.

- [ ] **Step 2: Ensure the Chromium build for this Playwright version exists**

Run: `npx playwright install chromium`
Expected: exits 0 quickly if the cached build matches (cache at `~/Library/Caches/ms-playwright` already holds chromium-1169/1187/1228); otherwise downloads once.

- [ ] **Step 3: Sanity-check launch**

Run:
```bash
node -e "import('playwright').then(async ({chromium}) => { const b = await chromium.launch(); console.log('chromium', b.version()); await b.close(); })"
```
Expected: prints `chromium <version>` and exits 0.

- [ ] **Step 4: Amend the spec's script names**

In `docs/superpowers/specs/2026-07-21-demo-pdf-skill-design.md`, replace the `scripts/` block of the "Skill anatomy" section with:

```
└── scripts/
    ├── csv_to_json.mjs       # tolerant mixed-encoding CSV → JSON records
    ├── capture_homepage.mjs  # Playwright screenshot of target homepage, overlay dismissal
    ├── verify_urls.mjs       # HTTP-checks every source URL; hard-fails on any miss
    └── render_pdf.mjs        # per page: measure content height → print 8.5in × auto → merge into one PDF
```

and append one line to the "Decisions made during brainstorming" table:

```
| Script runtime | Node 24 `.mjs` (playwright + pdf-lib devDependencies; machine has no Python playwright/pypdf) |
```

- [ ] **Step 5: Ignore build artifacts**

Append to `.gitignore`:

```
demo_pdf/*/build/
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore docs/superpowers/specs/2026-07-21-demo-pdf-skill-design.md
git commit -m "chore: add playwright + pdf-lib for demo-pdf skill; amend spec to Node scripts

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `csv_to_json.mjs` — tolerant CSV → JSON

**Files:**
- Create: `.claude/skills/demo-pdf/scripts/csv_to_json.mjs`
- Test: `.claude/skills/demo-pdf/tests/csv_to_json.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `decodeMixed(buf: Buffer): string` — UTF-8 with per-byte cp1252 fallback; unmappable bytes become `�`.
  - `parseCsv(text: string): string[][]` — RFC 4180 (quoted fields, `""` escapes, embedded commas/newlines, CRLF).
  - `csvToRecords(buf: Buffer): Record<string, string>[]` — first row is the header; values trimmed.
  - CLI: `node .claude/skills/demo-pdf/scripts/csv_to_json.mjs <file.csv>` prints a pretty JSON array of records to stdout.

- [ ] **Step 1: Write the failing test**

Create `.claude/skills/demo-pdf/tests/csv_to_json.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { decodeMixed, parseCsv, csvToRecords } from "../scripts/csv_to_json.mjs";

test("decodeMixed passes clean UTF-8 through", () => {
  const s = "café — “curly” ’quotes’";
  assert.equal(decodeMixed(Buffer.from(s, "utf-8")), s);
});

test("decodeMixed repairs stray cp1252 bytes inside UTF-8 text", () => {
  const buf = Buffer.concat([
    Buffer.from("Yes ", "utf-8"),
    Buffer.from([0x97]), // cp1252 em dash
    Buffer.from(" it works ", "utf-8"),
    Buffer.from([0x92]), // cp1252 right single quote
  ]);
  assert.equal(decodeMixed(buf), "Yes — it works ’");
});

test("decodeMixed turns unmappable bytes into U+FFFD", () => {
  const buf = Buffer.concat([Buffer.from("a", "utf-8"), Buffer.from([0x9d]), Buffer.from("b", "utf-8")]);
  assert.equal(decodeMixed(buf), "a�b");
});

test("parseCsv handles quotes, escaped quotes, embedded commas and newlines, CRLF", () => {
  const rows = parseCsv('h1,h2\r\n"a,1","say ""hi""\nsecond line"\r\nplain,last\n');
  assert.deepEqual(rows, [
    ["h1", "h2"],
    ["a,1", 'say "hi"\nsecond line'],
    ["plain", "last"],
  ]);
});

test("csvToRecords maps header to trimmed values", () => {
  const recs = csvToRecords(Buffer.from("name, url \nAlpha , https://x.test/a \n", "utf-8"));
  assert.deepEqual(recs, [{ name: "Alpha", url: "https://x.test/a" }]);
});

test("csvToRecords parses the real example page1 CSV", () => {
  const buf = fs.readFileSync("demo_pdf/example-prospect/page1_leads.csv");
  const recs = csvToRecords(buf);
  assert.equal(recs.length, 3);
  assert.deepEqual(
    recs.map((r) => r.lead_order),
    ["1", "2", "3"]
  );
  assert.ok(recs[0].answer_text.length > 1000);
  assert.equal(recs[0].target_homepage_url, "https://www.example-blog.com/");
});
```

Note: this fixture test reads the real CSV relative to the repo root, so `node --test` must run from the repo root (a Global Constraint).

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test .claude/skills/demo-pdf/tests/csv_to_json.test.mjs`
Expected: FAIL — `Cannot find module '../scripts/csv_to_json.mjs'`.

- [ ] **Step 3: Write the implementation**

Create `.claude/skills/demo-pdf/scripts/csv_to_json.mjs`:

```js
// Tolerant CSV reader for prospect folders. The source CSVs are assembled by
// hand from multiple tools and can contain stray cp1252 bytes inside UTF-8.
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const utf8Strict = new TextDecoder("utf-8", { fatal: true });
const cp1252 = new TextDecoder("windows-1252");

export function decodeMixed(buf) {
  try {
    return utf8Strict.decode(buf);
  } catch {
    /* fall through to byte-wise repair */
  }
  let out = "";
  let pos = 0;
  while (pos < buf.length) {
    let decoded = null;
    for (let len = 1; len <= 4 && pos + len <= buf.length; len++) {
      try {
        decoded = utf8Strict.decode(buf.subarray(pos, pos + len));
        pos += len;
        break;
      } catch {
        /* incomplete or invalid — try one byte longer */
      }
    }
    if (decoded === null) {
      out += cp1252.decode(buf.subarray(pos, pos + 1));
      pos += 1;
    } else {
      out += decoded;
    }
  }
  // cp1252 leaves undefined slots (0x81, 0x8d, 0x8f, 0x90, 0x9d) as C1 controls;
  // surface them as U+FFFD so the QA pass can find and resolve them.
  return out.replace(/[\u0080-\u009f]/g, "\uFFFD");
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export function csvToRecords(buf) {
  const [header, ...rows] = parseCsv(decodeMixed(buf));
  return rows.map((r) =>
    Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()]))
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node csv_to_json.mjs <file.csv>");
    process.exit(2);
  }
  console.log(JSON.stringify(csvToRecords(fs.readFileSync(file)), null, 2));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test .claude/skills/demo-pdf/tests/csv_to_json.test.mjs`
Expected: all 6 tests PASS.

- [ ] **Step 5: CLI smoke on real data**

Run: `node .claude/skills/demo-pdf/scripts/csv_to_json.mjs demo_pdf/example-prospect/page2_clusters.csv | head -20`
Expected: JSON array; first record has `"cluster_name": "Favorite painting products"` and `"is_featured": "yes"`.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/demo-pdf/scripts/csv_to_json.mjs .claude/skills/demo-pdf/tests/csv_to_json.test.mjs
git commit -m "feat(demo-pdf): tolerant mixed-encoding CSV to JSON script

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `verify_urls.mjs` — source URL verification gate

**Files:**
- Create: `.claude/skills/demo-pdf/scripts/verify_urls.mjs`
- Test: `.claude/skills/demo-pdf/tests/verify_urls.test.mjs`

**Interfaces:**
- Consumes: `csvToRecords` from `../scripts/csv_to_json.mjs` (Task 2).
- Produces:
  - `extractUrls(records: Record<string,string>[]): string[]` — every `http(s)` URL in any cell (semicolon lists, bare cells, and inline `[Cite](url)` markdown), deduped, trailing `.,` stripped.
  - `checkUrl(url, { timeoutMs?, fetchImpl? }): Promise<{url, ok, status, error?}>` — GET with browser User-Agent, follows redirects, `ok = status < 400`.
  - `checkAll(urls, opts?): Promise<result[]>` — concurrency 5.
  - CLI: `node .claude/skills/demo-pdf/scripts/verify_urls.mjs <a.csv> [b.csv ...]` prints one `PASS`/`FAIL` line per URL; exit 0 only if every URL passes.

- [ ] **Step 1: Write the failing test**

Create `.claude/skills/demo-pdf/tests/verify_urls.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { extractUrls, checkUrl, checkAll } from "../scripts/verify_urls.mjs";

test("extractUrls finds semicolon lists, bare cells, and Cite links", () => {
  const records = [
    {
      urls: "https://a.test/one.html; https://a.test/two.html",
      home: "https://a.test/",
      answer: "Do this [Cite](https://a.test/three.html). Then that [Cite](https://a.test/one.html).",
    },
  ];
  assert.deepEqual(extractUrls(records).sort(), [
    "https://a.test/",
    "https://a.test/one.html",
    "https://a.test/three.html",
    "https://a.test/two.html",
  ]);
});

test("extractUrls strips trailing punctuation", () => {
  assert.deepEqual(extractUrls([{ a: "see https://a.test/x." }]), ["https://a.test/x"]);
});

function serve(handler) {
  return new Promise((resolve) => {
    const srv = http.createServer(handler);
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

test("checkUrl passes 200 and fails 404 and dead servers", async () => {
  const srv = await serve((req, res) => {
    if (req.url === "/ok") {
      res.writeHead(200);
      res.end("hi");
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    assert.equal((await checkUrl(`${base}/ok`)).ok, true);
    const miss = await checkUrl(`${base}/missing`);
    assert.equal(miss.ok, false);
    assert.equal(miss.status, 404);
    const dead = await checkUrl("http://127.0.0.1:1/nope", { timeoutMs: 2000 });
    assert.equal(dead.ok, false);
    assert.equal(dead.status, 0);
  } finally {
    srv.close();
  }
});

test("checkAll returns one result per url", async () => {
  const srv = await serve((req, res) => {
    res.writeHead(200);
    res.end();
  });
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    const urls = Array.from({ length: 7 }, (_, i) => `${base}/p${i}`);
    const results = await checkAll(urls);
    assert.equal(results.length, 7);
    assert.ok(results.every((r) => r.ok));
  } finally {
    srv.close();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test .claude/skills/demo-pdf/tests/verify_urls.test.mjs`
Expected: FAIL — `Cannot find module '../scripts/verify_urls.mjs'`.

- [ ] **Step 3: Write the implementation**

Create `.claude/skills/demo-pdf/scripts/verify_urls.mjs`:

```js
// Hard gate: every URL that will appear in the PDF must resolve. A demo sent
// to a prospect with a dead citation link kills the pitch.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { csvToRecords } from "./csv_to_json.mjs";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export function extractUrls(records) {
  const urls = new Set();
  const re = /https?:\/\/[^\s;"')\]]+/g;
  for (const rec of records) {
    for (const val of Object.values(rec)) {
      for (const m of String(val).matchAll(re)) {
        urls.add(m[0].replace(/[.,]+$/, ""));
      }
    }
  }
  return [...urls];
}

export async function checkUrl(url, { timeoutMs = 15000, fetchImpl = fetch } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,*/*" },
    });
    return { url, ok: res.status < 400, status: res.status };
  } catch (err) {
    return { url, ok: false, status: 0, error: String(err?.cause ?? err) };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkAll(urls, opts = {}) {
  const queue = [...urls];
  const results = [];
  const workers = Array.from({ length: 5 }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      results.push(await checkUrl(url, opts));
    }
  });
  await Promise.all(workers);
  return results;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("usage: node verify_urls.mjs <a.csv> [b.csv ...]");
    process.exit(2);
  }
  const records = files.flatMap((f) => csvToRecords(fs.readFileSync(f)));
  const urls = extractUrls(records);
  const results = await checkAll(urls);
  results.sort((a, b) => a.url.localeCompare(b.url));
  let failures = 0;
  for (const r of results) {
    const tag = r.ok ? "PASS" : "FAIL";
    if (!r.ok) failures++;
    console.log(`${tag} ${r.status || "ERR"} ${r.url}${r.error ? ` (${r.error})` : ""}`);
  }
  console.log(`\n${results.length} urls, ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test .claude/skills/demo-pdf/tests/verify_urls.test.mjs`
Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/demo-pdf/scripts/verify_urls.mjs .claude/skills/demo-pdf/tests/verify_urls.test.mjs
git commit -m "feat(demo-pdf): source URL verification gate

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `capture_homepage.mjs` — homepage screenshot

**Files:**
- Create: `.claude/skills/demo-pdf/scripts/capture_homepage.mjs`
- Test: `.claude/skills/demo-pdf/tests/capture_homepage.test.mjs`

**Interfaces:**
- Consumes: `playwright` (Task 1).
- Produces:
  - `captureHomepage(url, outPath, { width=1440, height=1050, fullPage=false }): Promise<void>` — writes a PNG.
  - CLI: `node .claude/skills/demo-pdf/scripts/capture_homepage.mjs <url> <out.png> [--full]`.

- [ ] **Step 1: Write the failing test**

Create `.claude/skills/demo-pdf/tests/capture_homepage.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { captureHomepage } from "../scripts/capture_homepage.mjs";

test("captures a 1440px-wide PNG of a local page", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "capture-"));
  const page = path.join(dir, "home.html");
  fs.writeFileSync(
    page,
    "<!doctype html><body style='background:#eee'><h1>Prospect Home</h1></body>"
  );
  const out = path.join(dir, "home.png");
  await captureHomepage(pathToFileURL(page).href, out);
  const png = fs.readFileSync(out);
  assert.deepEqual([...png.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]); // PNG magic
  assert.equal(png.readUInt32BE(16), 1440); // IHDR width
  assert.equal(png.readUInt32BE(20), 1050); // IHDR height
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test .claude/skills/demo-pdf/tests/capture_homepage.test.mjs`
Expected: FAIL — `Cannot find module '../scripts/capture_homepage.mjs'`.

- [ ] **Step 3: Write the implementation**

Create `.claude/skills/demo-pdf/scripts/capture_homepage.mjs`:

```js
// Screenshot the prospect homepage for the Page 1 hero. Viewport-sized by
// default: that is what a visitor sees on load, and it keeps the hero crop
// predictable. Cookie/consent overlays are dismissed best-effort.
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const OVERLAY_BUTTONS = [/accept/i, /agree/i, /got it/i, /^ok$/i, /consent/i, /allow all/i, /^close$/i];

async function dismissOverlays(page) {
  for (const name of OVERLAY_BUTTONS) {
    const btn = page.getByRole("button", { name }).first();
    try {
      if (await btn.isVisible({ timeout: 300 })) {
        await btn.click({ timeout: 1000 });
        await page.waitForTimeout(400);
      }
    } catch {
      /* overlay heuristics are best-effort by design */
    }
  }
}

export async function captureHomepage(url, outPath, { width = 1440, height = 1050, fullPage = false } = {}) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height }, userAgent: undefined, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await dismissOverlays(page);
    await page.waitForTimeout(800);
    await page.screenshot({ path: outPath, fullPage });
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [url, out] = process.argv.slice(2);
  if (!url || !out) {
    console.error("usage: node capture_homepage.mjs <url> <out.png> [--full]");
    process.exit(2);
  }
  await captureHomepage(url, out, { fullPage: process.argv.includes("--full") });
  console.log(`captured ${url} -> ${out}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test .claude/skills/demo-pdf/tests/capture_homepage.test.mjs`
Expected: PASS.

- [ ] **Step 5: Live smoke against the real prospect site**

Run:
```bash
OUT=$(mktemp -d) && node .claude/skills/demo-pdf/scripts/capture_homepage.mjs "https://www.example-blog.com/" "$OUT/homepage.png" && ls -la "$OUT/homepage.png"
```
Expected: PNG file > 100 KB. Then view it with the Read tool to confirm the homepage rendered (no blank page, no bot-block interstitial). If the site blocks headless Chromium, note it in the task report — Task 8's acceptance run will need `chromium.launch({ headless: false })` guidance from SKILL.md's troubleshooting section.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/demo-pdf/scripts/capture_homepage.mjs .claude/skills/demo-pdf/tests/capture_homepage.test.mjs
git commit -m "feat(demo-pdf): homepage screenshot capture script

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: `render_pdf.mjs` — tall-page rendering + merge

**Files:**
- Create: `.claude/skills/demo-pdf/scripts/render_pdf.mjs`
- Test: `.claude/skills/demo-pdf/tests/render_pdf.test.mjs`

**Interfaces:**
- Consumes: `playwright`, `pdf-lib` (Task 1).
- Produces:
  - `renderPageToPdf(htmlPath, outPdfPath, browser): Promise<{heightPx: number}>` — loads `file://` HTML at 816 px viewport width, measures `document.documentElement.scrollHeight`, prints one PDF page 8.5 in × (height/96 + 0.05) in, `printBackground`, zero margins.
  - `mergePdfs(inputPaths: string[], outPath: string): Promise<void>`.
  - CLI: `node .claude/skills/demo-pdf/scripts/render_pdf.mjs <out.pdf> <page1.html> [page2.html ...]` — renders each HTML to `<out>.pN.pdf`, merges in argument order.

- [ ] **Step 1: Write the failing test**

Create `.claude/skills/demo-pdf/tests/render_pdf.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import { renderPageToPdf, mergePdfs } from "../scripts/render_pdf.mjs";

test("renders one tall page at exactly 8.5in wide", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "render-"));
  const html = path.join(dir, "tall.html");
  fs.writeFileSync(
    html,
    "<!doctype html><style>body{margin:0;width:816px}div{height:3000px;background:linear-gradient(#fff,#ccc)}</style><div>tall content</div>"
  );
  const out = path.join(dir, "tall.pdf");
  const browser = await chromium.launch();
  try {
    const { heightPx } = await renderPageToPdf(html, out, browser);
    assert.ok(heightPx >= 3000);
  } finally {
    await browser.close();
  }
  const doc = await PDFDocument.load(fs.readFileSync(out));
  assert.equal(doc.getPageCount(), 1); // tall content must NOT paginate
  const { width, height } = doc.getPage(0).getSize();
  assert.ok(Math.abs(width - 612) < 1); // 8.5in = 612pt
  assert.ok(height > 2200); // 3000px ≈ 2250pt
});

test("mergePdfs concatenates pages in order", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "merge-"));
  const mk = async (w) => {
    const d = await PDFDocument.create();
    d.addPage([w, 100]);
    const p = path.join(dir, `${w}.pdf`);
    fs.writeFileSync(p, await d.save());
    return p;
  };
  const a = await mk(200);
  const b = await mk(300);
  const out = path.join(dir, "merged.pdf");
  await mergePdfs([a, b], out);
  const doc = await PDFDocument.load(fs.readFileSync(out));
  assert.equal(doc.getPageCount(), 2);
  assert.equal(doc.getPage(0).getSize().width, 200);
  assert.equal(doc.getPage(1).getSize().width, 300);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test .claude/skills/demo-pdf/tests/render_pdf.test.mjs`
Expected: FAIL — `Cannot find module '../scripts/render_pdf.mjs'`.

- [ ] **Step 3: Write the implementation**

Create `.claude/skills/demo-pdf/scripts/render_pdf.mjs`:

```js
// Prints filled page templates as "tall pages": Letter width, content height.
// Sales PDFs are read on screen; one unbroken page per section beats
// arbitrary Letter-height page breaks through a homepage screenshot.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const PAGE_WIDTH_IN = 8.5;
const CSS_PPI = 96;

export async function renderPageToPdf(htmlPath, outPdfPath, browser) {
  const page = await browser.newPage({ viewport: { width: PAGE_WIDTH_IN * CSS_PPI, height: 1000 } });
  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    const heightPx = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.pdf({
      path: outPdfPath,
      width: `${PAGE_WIDTH_IN}in`,
      height: `${(heightPx / CSS_PPI + 0.05).toFixed(2)}in`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1",
    });
    return { heightPx };
  } finally {
    await page.close();
  }
}

export async function mergePdfs(inputPaths, outPath) {
  const merged = await PDFDocument.create();
  for (const p of inputPaths) {
    const src = await PDFDocument.load(fs.readFileSync(p));
    const pages = await merged.copyPages(src, src.getPageIndices());
    for (const pg of pages) merged.addPage(pg);
  }
  fs.writeFileSync(outPath, await merged.save());
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [out, ...htmls] = process.argv.slice(2);
  if (!out || htmls.length === 0) {
    console.error("usage: node render_pdf.mjs <out.pdf> <page1.html> [page2.html ...]");
    process.exit(2);
  }
  const browser = await chromium.launch();
  const parts = [];
  try {
    for (const [i, html] of htmls.entries()) {
      const part = out.replace(/\.pdf$/i, `.p${i + 1}.pdf`);
      const { heightPx } = await renderPageToPdf(html, part, browser);
      console.log(`${html} -> ${part} (${heightPx}px tall)`);
      parts.push(part);
    }
  } finally {
    await browser.close();
  }
  await mergePdfs(parts, out);
  console.log(`merged ${parts.length} page(s) -> ${out}`);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test .claude/skills/demo-pdf/tests/render_pdf.test.mjs`
Expected: both tests PASS.

- [ ] **Step 5: Run the full script test suite**

Run: `node --test .claude/skills/demo-pdf/tests/`
Expected: all tests across the four test files PASS.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/demo-pdf/scripts/render_pdf.mjs .claude/skills/demo-pdf/tests/render_pdf.test.mjs
git commit -m "feat(demo-pdf): tall-page PDF rendering and merge script

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Templates — `tokens.css` + `page3.html` (content gaps)

**Files:**
- Create: `.claude/skills/demo-pdf/templates/tokens.css`
- Create: `.claude/skills/demo-pdf/templates/page3.html`

**Interfaces:**
- Consumes: layout of `demo_pdf/example-prospect/page3_wireframe.html` (approved artifact); `render_pdf.mjs` CLI (Task 5) for the smoke check.
- Produces: `tokens.css` classes used by ALL page templates: `.page`, `.eyebrow`, `h1`, `.lede`, `.card`, `.chip`, `.masked`, `.question`, `.post`, `.post-title`, `.post-covers`, `.section`, `.section-label`, `.stack`. Placeholder convention for all templates: `{{NAME}}` for scalar slots; repeated blocks delimited by `<!-- BEGIN:block_name -->` / `<!-- END:block_name -->` comments that the filling agent duplicates per data row.

- [ ] **Step 1: Create `tokens.css`**

Create `.claude/skills/demo-pdf/templates/tokens.css`:

```css
/* Shared print palette for demo PDFs. Lifted from the approved
   demo_pdf/example-prospect/page3_wireframe.html; widget accents match
   the product's terracotta mark. */
:root {
  --page-bg: #fbf9f3;
  --surface: #ffffff;
  --surface-1: #f5f2ea;
  --border: rgba(0, 0, 0, 0.08);
  --ink: #2c2c2a;
  --ink-muted: #6b6b65;
  --bg-accent: #e8e3d5;
  --text-accent: #6b5d3e;
  --accent: #c2552f;
  --accent-soft: #f6e3d9;
  --accent-ink: #fff7f2;
  --teal: #3e7c74;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-voice: Georgia, "Times New Roman", serif;
  --radius: 8px;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  width: 816px;
  background: var(--page-bg);
  font-family: var(--font-sans);
  color: var(--ink);
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page { padding: 48px; }
.eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
  font-weight: 500;
  margin-bottom: 6px;
}
h1 { font-size: 22px; font-weight: 500; margin: 0 0 6px; color: var(--ink); }
h2 { font-size: 18px; font-weight: 500; margin: 0 0 2px; color: var(--ink); }
.lede { font-size: 14px; color: var(--ink-muted); margin: 0 0 24px; line-height: 1.5; }
.card {
  background: var(--surface);
  border-radius: 12px;
  border: 0.5px solid var(--border);
  padding: 20px;
}
.chip {
  display: inline-block;
  border-radius: 999px;
  background: var(--bg-accent);
  color: var(--text-accent);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 10px;
}
.masked { font-variant-numeric: tabular-nums; color: var(--ink-muted); }
.section { border-top: 0.5px solid var(--border); padding-top: 16px; margin-bottom: 20px; }
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 500;
}
.section-label svg { width: 16px; height: 16px; color: var(--ink-muted); }
.stack { display: flex; flex-direction: column; gap: 8px; }
.question {
  background: var(--surface-1);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-size: 14px;
  font-family: var(--font-voice);
  font-style: italic;
  color: var(--ink);
}
.post { padding: 10px 12px; background: var(--surface-1); border-radius: var(--radius); }
.post-title { font-size: 14px; font-weight: 500; margin-bottom: 3px; color: var(--ink); }
.post-covers { font-size: 13px; color: var(--ink-muted); }
.footer-band {
  margin-top: 28px;
  padding-top: 14px;
  border-top: 0.5px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--ink-muted);
}
```

- [ ] **Step 2: Create `page3.html`**

Create `.claude/skills/demo-pdf/templates/page3.html` — the approved wireframe, externalized onto `tokens.css` and parameterized:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Page 3 — Scattered content gaps</title>
<link rel="stylesheet" href="tokens.css">
<style>
  .card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .badge {
    min-width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg-accent);
    display: flex; align-items: center; justify-content: center;
    font-weight: 500; font-size: 14px; color: var(--text-accent);
  }
  .meta { font-size: 13px; color: var(--ink-muted); }
  .bridge { border-top: 0.5px solid var(--border); padding-top: 16px; }
  .bridge p {
    margin: 0; font-family: var(--font-voice); font-style: italic;
    font-size: 15px; line-height: 1.6; color: var(--ink);
  }
  .container { max-width: 720px; margin: 0 auto; }
</style>
</head>
<body>
<div class="page">
<div class="container">

  <div class="eyebrow">Content insights</div>
  <h1>Answers scattered across your archive</h1>
  <p class="lede">Questions your readers ask that your content already answers, just spread across multiple posts. Right now they have to hunt. The widget stitches them together.</p>

  <div class="card">

    <div class="card-header">
      <div class="badge">1</div>
      <div style="flex: 1;">
        <h2>{{GAP_TITLE}}</h2>
        <div class="meta">Recurring reader interest · touched in {{POST_COUNT}} of your posts</div>
      </div>
    </div>

    <div class="section">
      <div class="section-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9h8"/><path d="M8 13h6"/><path d="M9 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-4 4Z"/></svg>
        <span>What readers actually asked</span>
      </div>
      <div class="stack">
        <!-- BEGIN:reader_question (one div per question in reader_questions, pipe-split) -->
        <div class="question">"{{QUESTION_TEXT}}"</div>
        <!-- END:reader_question -->
      </div>
    </div>

    <div class="section">
      <div class="section-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>
        <span>Where the answer lives across your posts</span>
      </div>
      <div class="stack">
        <!-- BEGIN:source_post (one div per CSV row of the featured gap, in source_post_order) -->
        <div class="post">
          <div class="post-title">{{SOURCE_POST_TITLE}}</div>
          <div class="post-covers">Covers: {{SOURCE_POST_COVERAGE}}</div>
        </div>
        <!-- END:source_post -->
      </div>
    </div>

    <div class="bridge">
      <p>{{BRIDGE_LINE}}</p>
    </div>

  </div>

</div>
</div>
</body>
</html>
```

- [ ] **Step 3: Smoke-render the template**

The template renders as-is (placeholders showing) to verify layout and the tokens link:

```bash
OUT=$(mktemp -d) && cp .claude/skills/demo-pdf/templates/tokens.css .claude/skills/demo-pdf/templates/page3.html "$OUT/" && node .claude/skills/demo-pdf/scripts/render_pdf.mjs "$OUT/page3.pdf" "$OUT/page3.html" && ls -la "$OUT/page3.pdf" && echo "$OUT"
```

Expected: 1-page PDF produced. View `$OUT/page3.pdf` with the Read tool: cream background, white card, circular badge, italic serif question rows, no unstyled text (which would indicate a broken tokens.css link).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/demo-pdf/templates/tokens.css .claude/skills/demo-pdf/templates/page3.html
git commit -m "feat(demo-pdf): shared tokens and page3 content-gaps template

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Template — `page2.html` (intent clusters)

**Files:**
- Create: `.claude/skills/demo-pdf/templates/page2.html`

**Interfaces:**
- Consumes: `tokens.css` classes (Task 6); layout reference `components/dashboard/intent-explorer.tsx` (two-column grid: cluster list left, detail right).
- Produces: template consumed by the fill step in Task 9's SKILL.md. Placeholders: `{{FEATURED_CLUSTER_NAME}}`, blocks `nav_item` (5 rows from `page2_clusters.csv` in `nav_order`; the featured one keeps class `featured`), `featured_question` (the featured row's `question_1..3`), `featured_post` (from `source_post_titles`, `; `-split). All numbers are pre-masked in the template as `X` / `XX%` — the fill step never touches them.

- [ ] **Step 1: Create `page2.html`**

Create `.claude/skills/demo-pdf/templates/page2.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Page 2 — What your readers are trying to do</title>
<link rel="stylesheet" href="tokens.css">
<style>
  .grid { display: grid; grid-template-columns: 264px 1fr; gap: 16px; align-items: start; }
  .nav-card { background: var(--surface); border-radius: 12px; border: 0.5px solid var(--border); overflow: hidden; }
  .nav-item { padding: 14px 16px; border-bottom: 0.5px solid var(--border); }
  .nav-item:last-child { border-bottom: none; }
  .nav-item.featured { background: var(--accent-soft); }
  .nav-label { font-size: 14px; font-weight: 500; color: var(--ink); }
  .nav-item.featured .nav-label { color: var(--accent); }
  .nav-meta { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .nav-bar { height: 6px; flex: 1; border-radius: 999px; background: var(--surface-1); overflow: hidden; }
  .nav-bar > span { display: block; height: 100%; border-radius: 999px; background: color-mix(in srgb, var(--teal) 55%, transparent); }
  .nav-count { font-size: 12px; }
  .detail-header { border-bottom: 0.5px solid var(--border); padding-bottom: 16px; margin-bottom: 16px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .detail-title { font-size: 22px; font-weight: 500; margin: 6px 0 0; }
  .stat { text-align: right; }
  .stat-big { font-size: 28px; font-weight: 500; }
  .stat-sub { font-size: 12px; color: var(--ink-muted); margin-top: 4px; }
  .trend-pill {
    display: inline-block; border-radius: 999px; padding: 2px 8px;
    background: color-mix(in srgb, var(--teal) 14%, transparent);
    color: var(--teal); font-size: 11px; font-weight: 600;
  }
  .post-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .post-chip {
    display: inline-block; border-radius: 999px; border: 0.5px solid var(--border);
    background: var(--surface); padding: 6px 12px; font-size: 12px; color: var(--ink);
  }
</style>
</head>
<body>
<div class="page">

  <div class="eyebrow">Visitor intelligence · Intent clusters</div>
  <h1>What your readers are trying to do</h1>
  <p class="lede">Questions asked in the widget, grouped into intent clusters. This is the demand map for your existing archive — volumes shown as X until your data flows in.</p>

  <div class="grid">

    <div class="nav-card">
      <!-- BEGIN:nav_item (5 rows from page2_clusters.csv in nav_order; featured row keeps class "featured", others drop it) -->
      <div class="nav-item featured">
        <div class="nav-label">{{CLUSTER_NAME}}</div>
        <div class="nav-meta">
          <div class="nav-bar"><span style="width: 62%"></span></div>
          <span class="nav-count masked">X</span>
        </div>
      </div>
      <!-- END:nav_item -->
    </div>

    <div class="card">
      <div class="detail-header">
        <div>
          <span class="chip">Featured cluster</span>
          <h2 class="detail-title">{{FEATURED_CLUSTER_NAME}}</h2>
        </div>
        <div class="stat">
          <div class="stat-big masked">X</div>
          <div class="stat-sub">questions · <span class="trend-pill masked">+XX%</span> WoW</div>
        </div>
      </div>

      <div class="section-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9h8"/><path d="M8 13h6"/><path d="M9 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-4 4Z"/></svg>
        <span>What readers actually asked</span>
      </div>
      <div class="stack" style="margin-bottom: 20px;">
        <!-- BEGIN:featured_question (question_1..3 of the featured row) -->
        <div class="question">"{{QUESTION_TEXT}}"</div>
        <!-- END:featured_question -->
      </div>

      <div class="section-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>
        <span>Where it&rsquo;s asked</span>
      </div>
      <div class="post-chips">
        <!-- BEGIN:featured_post (source_post_titles of the featured row, "; "-split) -->
        <span class="post-chip">{{POST_TITLE}}</span>
        <!-- END:featured_post -->
      </div>
    </div>

  </div>

</div>
</body>
</html>
```

Note: the four non-featured `nav_item` copies must not have the `featured` class, and their `.nav-bar > span` widths should vary decoratively (use 62%, 48%, 41%, 33%, 27% top to bottom) — the bars are texture, not data, and the counts stay `X`.

- [ ] **Step 2: Smoke-render**

```bash
OUT=$(mktemp -d) && cp .claude/skills/demo-pdf/templates/tokens.css .claude/skills/demo-pdf/templates/page2.html "$OUT/" && node .claude/skills/demo-pdf/scripts/render_pdf.mjs "$OUT/page2.pdf" "$OUT/page2.html" && echo "$OUT"
```

Expected: 1-page PDF. View with the Read tool: two-column layout, featured nav item tinted, masked `X`/`+XX%` stats, question rows and post chips visible.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/demo-pdf/templates/page2.html
git commit -m "feat(demo-pdf): page2 intent-clusters template

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Template — `page1.html` (surfaced answer hero + leads)

**Files:**
- Create: `.claude/skills/demo-pdf/templates/page1.html`

**Interfaces:**
- Consumes: `tokens.css` (Task 6); widget look reference `components/widget/visitor-widget.tsx` and mark SVG `components/brand.tsx`; a `homepage.png` sitting next to the filled HTML (produced by `capture_homepage.mjs`).
- Produces: template consumed by the fill step. Scalar placeholders: `{{SITE_NAME}}`, `{{AUTHOR_NAME}}`, `{{WIDGET_QUESTION}}` (lead 1's question), `{{WIDGET_ANSWER_PREVIEW}}` (first 1-2 paragraphs of lead 1's answer as HTML — visually cropped by CSS). Block `lead_row` per lead: `{{CLUSTER_NAME}}`, `{{LEAD_NUMBER}}`, `{{LEAD_QUESTION}}`, `{{ANSWER_HTML}}`, block `source_chip` inside it: `{{CITE_NUMBER}}`, `{{CITE_LABEL}}`.

- [ ] **Step 1: Create `page1.html`**

Create `.claude/skills/demo-pdf/templates/page1.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Page 1 — Your readers, already asking</title>
<link rel="stylesheet" href="tokens.css">
<style>
  /* hero: homepage screenshot with the widget floating bottom-right */
  .hero {
    position: relative;
    border-radius: 12px;
    border: 0.5px solid var(--border);
    overflow: hidden;
    box-shadow: 0 12px 40px -18px rgba(0, 0, 0, 0.35);
  }
  .hero img { display: block; width: 100%; }
  .widget {
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 300px;
    background: #ffffff;
    border-radius: 16px;
    border: 0.5px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 18px 50px -12px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    font-size: 12px;
  }
  .widget-header {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px;
    background: #faf7f2;
    border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
  }
  .widget-mark {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--accent-soft);
    display: flex; align-items: center; justify-content: center;
  }
  .widget-mark svg { width: 15px; height: 15px; }
  .widget-title { font-size: 12px; font-weight: 600; color: #2c2c2a; line-height: 1.25; }
  .widget-sub { font-size: 10px; color: #6b6b65; }
  .widget-messages { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
  .bubble-visitor {
    align-self: flex-end;
    max-width: 84%;
    background: #2c2c2a; color: #fbf9f3;
    border-radius: 14px 14px 4px 14px;
    padding: 7px 10px;
    line-height: 1.45;
  }
  .bubble-author-row { display: flex; gap: 7px; }
  .bubble-author-avatar {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
    background: var(--accent-soft);
    display: flex; align-items: center; justify-content: center;
  }
  .bubble-author-avatar svg { width: 12px; height: 12px; }
  .bubble-author {
    background: #fbf9f3;
    border: 0.5px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px 14px 14px 4px;
    padding: 8px 10px;
    line-height: 1.5;
    position: relative;
    max-height: 150px;
    overflow: hidden;
  }
  .bubble-author p { margin: 0 0 6px; }
  .bubble-author .fade {
    position: absolute; left: 0; right: 0; bottom: 0; height: 44px;
    background: linear-gradient(rgba(251, 249, 243, 0), #fbf9f3 85%);
  }
  .widget-input {
    display: flex; align-items: center; gap: 6px;
    margin: 0 12px 8px;
    border: 0.5px solid rgba(0, 0, 0, 0.12);
    border-radius: 10px;
    padding: 7px 10px;
    color: #9a9a93;
  }
  .widget-input .send {
    margin-left: auto;
    width: 22px; height: 22px; border-radius: 6px;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
  }
  .widget-input .send svg { width: 11px; height: 11px; stroke: #fff; }
  .widget-footer {
    text-align: center; font-size: 8.5px; color: #9a9a93;
    padding: 5px 0 7px;
    border-top: 0.5px solid rgba(0, 0, 0, 0.06);
  }
  /* lead rows */
  .lead { margin-top: 16px; }
  .lead-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .lead-num {
    min-width: 26px; height: 26px; border-radius: 50%;
    background: var(--bg-accent); color: var(--text-accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600;
  }
  .lead-question {
    font-family: var(--font-voice); font-style: italic;
    font-size: 15px; margin: 0 0 10px;
  }
  .answer { font-size: 13px; line-height: 1.6; color: var(--ink); }
  .answer p { margin: 0 0 8px; }
  .answer ul { margin: 0 0 8px; padding-left: 18px; }
  .answer li { margin-bottom: 4px; }
  .answer sup.cite {
    font-size: 9px; font-weight: 700; color: var(--accent);
    padding-left: 1px;
  }
  .answer-sources { margin-top: 10px; padding-top: 10px; border-top: 0.5px solid var(--border); }
  .answer-sources .label {
    font-size: 10px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--ink-muted); margin-bottom: 6px;
  }
  .src {
    display: inline-flex; align-items: center; gap: 5px;
    border: 0.5px solid var(--border); border-radius: 6px;
    background: var(--surface-1);
    padding: 3px 8px; margin: 0 6px 6px 0;
    font-size: 11px; color: var(--ink);
  }
  .src .n {
    display: inline-flex; align-items: center; justify-content: center;
    width: 13px; height: 13px; border-radius: 3px;
    background: var(--accent-soft); color: var(--accent);
    font-size: 8.5px; font-weight: 700;
  }
</style>
</head>
<body>
<div class="page">

  <div class="eyebrow">Visitor intelligence · Demo for {{SITE_NAME}}</div>
  <h1>Your readers, already asking</h1>
  <p class="lede">This is your homepage with the widget installed. Visitors ask in their own words; the widget answers from your archive, with citations back to your posts. Below: three real reader questions and the answers the widget surfaced.</p>

  <div class="hero">
    <img src="homepage.png" alt="{{SITE_NAME}} homepage">
    <div class="widget">
      <div class="widget-header">
        <span class="widget-mark">
          <svg viewBox="0 0 32 32" fill="none"><path d="M6 4.5h20a3.5 3.5 0 0 1 3.5 3.5v12a3.5 3.5 0 0 1-3.5 3.5H13.2L7 27.2a.7.7 0 0 1-1.2-.5V23.5H6A3.5 3.5 0 0 1 2.5 20V8A3.5 3.5 0 0 1 6 4.5Z" fill="#c2552f"/><rect x="9" y="15.5" width="2.6" height="3.5" rx="1.3" fill="#fff7f2"/><rect x="14.7" y="12" width="2.6" height="7" rx="1.3" fill="#fff7f2"/><rect x="20.4" y="8.5" width="2.6" height="10.5" rx="1.3" fill="#fff7f2"/></svg>
        </span>
        <span>
          <span class="widget-title">Ask {{AUTHOR_NAME}}</span><br>
          <span class="widget-sub">Answers from {{SITE_NAME}}</span>
        </span>
      </div>
      <div class="widget-messages">
        <div class="bubble-visitor">{{WIDGET_QUESTION}}</div>
        <div class="bubble-author-row">
          <span class="bubble-author-avatar">
            <svg viewBox="0 0 32 32" fill="none"><path d="M6 4.5h20a3.5 3.5 0 0 1 3.5 3.5v12a3.5 3.5 0 0 1-3.5 3.5H13.2L7 27.2a.7.7 0 0 1-1.2-.5V23.5H6A3.5 3.5 0 0 1 2.5 20V8A3.5 3.5 0 0 1 6 4.5Z" fill="#c2552f"/><rect x="9" y="15.5" width="2.6" height="3.5" rx="1.3" fill="#fff7f2"/><rect x="14.7" y="12" width="2.6" height="7" rx="1.3" fill="#fff7f2"/><rect x="20.4" y="8.5" width="2.6" height="10.5" rx="1.3" fill="#fff7f2"/></svg>
          </span>
          <div class="bubble-author">
            {{WIDGET_ANSWER_PREVIEW}}
            <div class="fade"></div>
          </div>
        </div>
      </div>
      <div class="widget-input">
        Ask about any project…
        <span class="send"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></span>
      </div>
      <div class="widget-footer">Powered by Visitor Intelligence</div>
    </div>
  </div>

  <!-- BEGIN:lead_row (one card per row of page1_leads.csv, in lead_order) -->
  <div class="card lead">
    <div class="lead-head">
      <span class="lead-num">{{LEAD_NUMBER}}</span>
      <span class="chip">{{CLUSTER_NAME}}</span>
    </div>
    <p class="lead-question">"{{LEAD_QUESTION}}"</p>
    <div class="answer">
      {{ANSWER_HTML}}
      <div class="answer-sources">
        <div class="label">Sources from {{AUTHOR_NAME}}&rsquo;s posts</div>
        <!-- BEGIN:source_chip (one per unique cited URL in this lead, numbered in first-appearance order) -->
        <span class="src"><span class="n">{{CITE_NUMBER}}</span>{{CITE_LABEL}}</span>
        <!-- END:source_chip -->
      </div>
    </div>
  </div>
  <!-- END:lead_row -->

  <div class="footer-band">
    <svg viewBox="0 0 32 32" fill="none" width="14" height="14"><path d="M6 4.5h20a3.5 3.5 0 0 1 3.5 3.5v12a3.5 3.5 0 0 1-3.5 3.5H13.2L7 27.2a.7.7 0 0 1-1.2-.5V23.5H6A3.5 3.5 0 0 1 2.5 20V8A3.5 3.5 0 0 1 6 4.5Z" fill="#c2552f"/><rect x="9" y="15.5" width="2.6" height="3.5" rx="1.3" fill="#fff7f2"/><rect x="14.7" y="12" width="2.6" height="7" rx="1.3" fill="#fff7f2"/><rect x="20.4" y="8.5" width="2.6" height="10.5" rx="1.3" fill="#fff7f2"/></svg>
    Visitor Intelligence · demo mockup — the widget is not installed on {{SITE_NAME}}
  </div>

</div>
</body>
</html>
```

- [ ] **Step 2: Smoke-render with a stand-in screenshot**

```bash
OUT=$(mktemp -d) \
  && cp .claude/skills/demo-pdf/templates/tokens.css .claude/skills/demo-pdf/templates/page1.html "$OUT/" \
  && printf '<!doctype html><body style="margin:0;background:#e8e0d0;font-family:Georgia"><div style="padding:80px;text-align:center"><h1 style="font-size:56px">Stand-in Homepage</h1><p>fixture page for smoke test</p></div></body>' > "$OUT/fixture.html" \
  && node .claude/skills/demo-pdf/scripts/capture_homepage.mjs "file://$OUT/fixture.html" "$OUT/homepage.png" \
  && node .claude/skills/demo-pdf/scripts/render_pdf.mjs "$OUT/page1.pdf" "$OUT/page1.html" \
  && echo "$OUT"
```

Expected: 1-page PDF. View with the Read tool: screenshot fills the hero, widget panel floats bottom-right over it with terracotta mark, "Ask {{AUTHOR_NAME}}" header, dark visitor bubble, cream author bubble with fade-out, one lead card below with chip/question/sources scaffolding, footer disclosure band present.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/demo-pdf/templates/page1.html
git commit -m "feat(demo-pdf): page1 surfaced-answer hero template

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: `SKILL.md` — process, guardrails, QA checklist

**Files:**
- Create: `.claude/skills/demo-pdf/SKILL.md`

**Interfaces:**
- Consumes: every script CLI (Tasks 2-5) and template placeholder convention (Tasks 6-8).
- Produces: the skill entry point an agent loads via `/demo-pdf`. Task 10 executes exactly this document.

- [ ] **Step 1: Create `SKILL.md`**

Create `.claude/skills/demo-pdf/SKILL.md` with exactly this content:

```markdown
---
name: demo-pdf
description: Generate a 3-page prospect demo PDF simulating the Visitor Intelligence widget installed on a target site. Use when asked to build a demo/sales PDF for a prospect from a demo_pdf/<prospect>/ folder of CSVs. Inputs - prospect folder path and the site author's first name.
---

# demo-pdf: prospect demo PDF generator

Turns `demo_pdf/<prospect>/` (three CSVs) into `demo_pdf/<prospect>/demo.pdf`:
a 3-page tall-page PDF — homepage hero with the widget overlaid, intent
clusters, scattered-content gap. Run everything from the repo root.

**Required inputs:** prospect folder path, author first name (drives "Ask
{Author}" branding). Optional: site display name (default: homepage domain
without `www.`, e.g. `example-blog.com`).

## Hard rules (violating any of these fails the run)

1. Cluster labels render verbatim from CSV `cluster_name`. Never rename.
2. Every URL must pass `verify_urls.mjs` BEFORE any rendering. If any URL
   fails, stop and report the failures. Do not fabricate or substitute URLs.
3. Page 2 numbers are always literal `X` / `+XX%` (pre-masked in the
   template — do not replace them).
4. Reader questions render exactly as written in the CSVs, including
   drafted ones. Never rephrase.
5. No U+FFFD (`�`) anywhere in filled HTML. Resolve each from context
   (cp1252 damage: usually em dash, curly quote, or apostrophe).
6. Story discipline: no affiliate chips, draft scaffolds, "Write it for
   me," credits meters, stat boxes, trend badges, "New" pills, or CTAs.
7. If the homepage screenshot fails or shows a bot-block page, stop and
   report. Never ship a placeholder background.

## Process

### 1. Parse inputs

For each of the three CSVs:

    node .claude/skills/demo-pdf/scripts/csv_to_json.mjs demo_pdf/<prospect>/page1_leads.csv

Read the JSON. Expect: page1 = 3 lead rows; page2 = 5 cluster rows exactly
one with `is_featured: "yes"`; page3 = rows grouped by `gap_id`. The
featured page-3 gap is the one whose posts belong to this prospect's site
(check `source_post_url` domains). If any expectation fails, stop and
report — never guess.

### 2. Verify URLs (hard gate)

    node .claude/skills/demo-pdf/scripts/verify_urls.mjs demo_pdf/<prospect>/page1_leads.csv demo_pdf/<prospect>/page2_clusters.csv demo_pdf/<prospect>/page3_scattered_content_gaps.csv

Exit code must be 0. Save the output — it is the verification log.

### 3. Capture the homepage

    mkdir -p demo_pdf/<prospect>/build
    node .claude/skills/demo-pdf/scripts/capture_homepage.mjs "<target_homepage_url from page1 CSV>" demo_pdf/<prospect>/build/homepage.png

View the PNG (Read tool). It must show the real homepage — not a blank
page, error, or consent wall. If blocked, retry once; if still blocked,
stop and report (troubleshooting: some sites require
`chromium.launch({ headless: false })` — edit nothing, just report).

### 4. Fill the templates

Copy `templates/tokens.css`, `page1.html`, `page2.html`, `page3.html`
into `demo_pdf/<prospect>/build/`. Fill the copies:

- `{{NAME}}` placeholders: replace with data. HTML-escape `&`, `<`, `>`
  in all CSV text.
- `<!-- BEGIN:block -->…<!-- END:block -->`: duplicate the enclosed
  markup once per data row (per the note in each block comment), then
  remove the marker comments.
- **Page 1 answer conversion** (`answer_text` → `{{ANSWER_HTML}}`):
  - Split into paragraphs on blank lines; lines starting `- ` become
    `<ul><li>` groups. Bold section headers like `Main steps (from the
    posts)` become `<p><strong>…</strong></p>`.
  - Replace each `[Cite](URL)` with `<sup class="cite">N</sup>` where N
    is that URL's 1-based index in the lead's unique-URL list (order of
    first appearance). Build one `source_chip` per unique URL:
    `{{CITE_NUMBER}}` = N, `{{CITE_LABEL}}` = the URL's slug, hyphens →
    spaces, `.html` stripped, sentence case, truncated to ~55 chars with
    `…`.
  - Render the answer IN FULL — no truncation in lead rows.
- **Page 1 widget preview**: `{{WIDGET_QUESTION}}` = lead 1's question;
  `{{WIDGET_ANSWER_PREVIEW}}` = lead 1's first 1-2 paragraphs as `<p>`s
  (cite links stripped) — CSS crops it with a fade; give it enough text
  to overflow the 150px max-height so the fade reads naturally.
- **Page 2**: 5 `nav_item`s in `nav_order` (only the featured row keeps
  class `featured`; bar widths 62/48/41/33/27% top to bottom); featured
  detail from the featured row's `question_1..3` and `source_post_titles`
  (`; `-split).
- **Page 3**: featured gap only. `{{POST_COUNT}}` = number of CSV rows
  for that gap, as a digit. Questions from `reader_questions`
  (pipe-split). One `source_post` per row in `source_post_order`.
  `{{BRIDGE_LINE}}` from the CSV, verbatim.

### 5. Render

    node .claude/skills/demo-pdf/scripts/render_pdf.mjs demo_pdf/<prospect>/demo.pdf demo_pdf/<prospect>/build/page1.html demo_pdf/<prospect>/build/page2.html demo_pdf/<prospect>/build/page3.html

### 6. QA (all must pass before you call it done)

Read `demo.pdf` (Read tool) and check every page:

- [ ] No `�` anywhere (also `grep -c '�'` each filled HTML → 0).
- [ ] Every cluster label matches its CSV `cluster_name` exactly (diff by
      eye against the csv_to_json output).
- [ ] Page 1: real homepage visible; widget floats bottom-right; 3 lead
      cards; every cite superscript has a matching numbered source chip.
- [ ] Page 2: 5 clusters, correct featured one, all numbers `X`/`+XX%`.
- [ ] Page 3: single gap card, plain-text `Covers:` lines, bridge line
      closes the card, no CTA.
- [ ] No clipped text, no overflowing boxes, no blank regions.
- [ ] Footer disclosure ("demo mockup — the widget is not installed…")
      present on page 1.

Fix and re-render until all boxes check. Report the QA result explicitly.
```

- [ ] **Step 2: Verify the skill loads**

Run: `head -5 .claude/skills/demo-pdf/SKILL.md`
Expected: frontmatter with `name: demo-pdf`. (Skill discovery is directory-based; a well-formed frontmatter block is the load requirement.)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/demo-pdf/SKILL.md
git commit -m "feat(demo-pdf): skill entry point with process and QA checklist

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Acceptance run — Example Blog demo.pdf

**Files:**
- Create: `demo_pdf/example-prospect/demo.pdf` (committed deliverable)
- Create: `demo_pdf/example-prospect/build/` (git-ignored working dir)

**Interfaces:**
- Consumes: the entire skill (Tasks 1-9). Author name: **Jane**. Site name: **example-blog.com**.
- Produces: the committed sales artifact and proof the skill works end-to-end.

- [ ] **Step 1: Execute SKILL.md exactly**

Follow `.claude/skills/demo-pdf/SKILL.md` steps 1-6 for prospect folder `demo_pdf/example-prospect`, author "Jane". Do not shortcut the process — this run validates the skill document itself. Where SKILL.md is ambiguous or wrong, fix SKILL.md (that is part of this task), then continue.

- [ ] **Step 2: Verify acceptance criteria from the spec**

All must hold:

- Page 1: example homepage background; widget shows lead 1 ("Can I follow your silicone mold method for concrete stones?"); 3 lead rows with full cited answers; cluster chips read exactly `Exterior and porch projects`, `Painting cabinets with smooth finish`, `Trim and molding prep`.
- Page 2: left column exactly `Favorite painting products`, `Exterior and porch projects`, `DIY curtains and window treatments`, `Furniture refinishing help`, `Walls floors and wallpaper projects`; featured = `Favorite painting products` with its 3 questions and 3 post titles; all numbers masked.
- Page 3: faux stone gap card only — title `Faux stone facade series`, `touched in 4 of your posts`, 4 questions, 4 posts in order, bridge line verbatim.
- `verify_urls.mjs` log shows 0 failures.
- Full test suite still green: `node --test .claude/skills/demo-pdf/tests/`
- QA checklist in SKILL.md fully checked; report each box's status.

- [ ] **Step 3: Commit the deliverable (and any SKILL.md fixes)**

```bash
git add demo_pdf/example-prospect/demo.pdf .claude/skills/demo-pdf/SKILL.md
git commit -m "feat(demo-pdf): Example Blog acceptance demo PDF

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Plan Self-Review (completed)

- **Spec coverage:** anatomy → Tasks 2-9; pipeline → Tasks 2-5; three page designs → Tasks 6-8; guardrails 1-6 → SKILL.md hard rules 1-6 (Task 9); error handling → SKILL.md steps 1-3 stop-and-report rules; acceptance → Task 10. Spec's `.py` names amended in Task 1.
- **Placeholder scan:** the only intentionally unfinished content is template `{{...}}` slots, which are the design — every script, template, and SKILL.md is given in full.
- **Type consistency:** `csvToRecords(Buffer) → Record<string,string>[]` consumed by `verify_urls.mjs`; `renderPageToPdf(html, out, browser)` signature matches tests and CLI; placeholder names in Task 9's fill instructions match Tasks 6-8 templates exactly (`{{GAP_TITLE}}`, `{{POST_COUNT}}`, `{{CLUSTER_NAME}}`, `{{FEATURED_CLUSTER_NAME}}`, `{{WIDGET_QUESTION}}`, `{{WIDGET_ANSWER_PREVIEW}}`, `{{ANSWER_HTML}}`, `{{CITE_NUMBER}}`, `{{CITE_LABEL}}`, `{{SITE_NAME}}`, `{{AUTHOR_NAME}}`, `{{LEAD_NUMBER}}`, `{{LEAD_QUESTION}}`, `{{QUESTION_TEXT}}`, `{{POST_TITLE}}`, `{{SOURCE_POST_TITLE}}`, `{{SOURCE_POST_COVERAGE}}`, `{{BRIDGE_LINE}}`).
