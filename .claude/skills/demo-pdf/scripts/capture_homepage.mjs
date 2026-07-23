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

// Full-page captures must scroll the page first, or below-the-fold
// lazy-loaded images screenshot as empty placeholders.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let scrolled = 0;
      const step = 600;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        scrolled += step;
        if (scrolled >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 120);
    });
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
}

export async function captureHomepage(url, outPath, { width = 1440, height = 1050, fullPage = false } = {}) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height }, userAgent: undefined, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await dismissOverlays(page);
    if (fullPage) await scrollThrough(page);
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
