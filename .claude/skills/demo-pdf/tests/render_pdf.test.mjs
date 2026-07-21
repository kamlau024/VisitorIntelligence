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

test("measures true content height, not the initial viewport floor", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "render-"));
  const html = path.join(dir, "short.html");
  fs.writeFileSync(
    html,
    "<!doctype html><style>body{margin:0;width:816px}div{height:300px;background:#eee}</style><div>short content</div>"
  );
  const out = path.join(dir, "short.pdf");
  const browser = await chromium.launch();
  try {
    await renderPageToPdf(html, out, browser);
  } finally {
    await browser.close();
  }
  const doc = await PDFDocument.load(fs.readFileSync(out));
  assert.equal(doc.getPageCount(), 1);
  const { width, height } = doc.getPage(0).getSize();
  assert.ok(Math.abs(width - 612) < 1); // 8.5in = 612pt
  // 300px content ≈ 229pt; the pre-fix bug (measuring documentElement,
  // which floors at the 1000px initial viewport) would have produced ~754pt.
  assert.ok(height < 400);
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
