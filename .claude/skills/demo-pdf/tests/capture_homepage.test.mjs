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
