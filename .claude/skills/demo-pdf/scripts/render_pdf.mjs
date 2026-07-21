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
    const heightPx = await page.evaluate(() => document.body.scrollHeight);
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
