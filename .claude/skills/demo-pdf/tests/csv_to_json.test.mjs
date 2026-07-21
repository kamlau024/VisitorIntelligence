import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { decodeMixed, parseCsv, csvToRecords } from "../scripts/csv_to_json.mjs";

test("decodeMixed passes clean UTF-8 through", () => {
  const s = "café — “curly” ‘quotes’";
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