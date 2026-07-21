// Tolerant CSV reader for prospect folders. The source CSVs are assembled by
// hand from multiple tools and can contain stray cp1252 bytes inside UTF-8.
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const utf8Strict = new TextDecoder("utf-8", { fatal: true });

// Windows-1252 mapping for bytes 0x80-0x9F
const cp1252Map = {
  0x80: 0x20AC, // €
  0x82: 0x201A, // ‚
  0x83: 0x0192, // ƒ
  0x84: 0x201E, // „
  0x85: 0x2026, // …
  0x86: 0x2020, // †
  0x87: 0x2021, // ‡
  0x88: 0x02C6, // ˆ
  0x89: 0x2030, // ‰
  0x8A: 0x0160, // Š
  0x8B: 0x2039, // ‹
  0x8C: 0x0152, // Œ
  0x8E: 0x017D, // Ž
  0x91: 0x2018, // '
  0x92: 0x2019, // '
  0x93: 0x201C, // "
  0x94: 0x201D, // "
  0x95: 0x2022, // •
  0x96: 0x2013, // –
  0x97: 0x2014, // —
  0x98: 0x02DC, // ˜
  0x99: 0x2122, // ™
  0x9A: 0x0161, // š
  0x9B: 0x203A, // ›
  0x9C: 0x0153, // œ
  0x9E: 0x017E, // ž
  0x9F: 0x0178, // Ÿ
};

function decodeCp1252Byte(byte) {
  if (byte >= 0x80 && byte <= 0x9F && cp1252Map[byte]) {
    return String.fromCharCode(cp1252Map[byte]);
  } else if (byte >= 0x80 && byte <= 0x9F) {
    // Undefined slot - will be replaced with U+FFFD later
    return String.fromCharCode(byte);
  } else {
    // Regular ASCII (0x00-0x7F) or extended ASCII (0xA0-0xFF)
    return String.fromCharCode(byte);
  }
}

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
      out += decodeCp1252Byte(buf[pos]);
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