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
