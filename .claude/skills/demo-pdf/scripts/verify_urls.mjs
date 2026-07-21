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
