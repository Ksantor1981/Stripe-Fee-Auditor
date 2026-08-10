import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "messages", "pages");

function countKeys(obj) {
  return {
    seo: Object.keys(obj.seo ?? {}).length,
    blog: Object.keys(obj.blog ?? {}).length,
  };
}

function shapeKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...shapeKeys(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return keys;
}

const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));
const enShape = new Set(shapeKeys(en));

console.log("en.json", fs.statSync(path.join(dir, "en.json")).size, "bytes", countKeys(en));

for (const locale of ["es", "de", "fr", "hi", "ru"]) {
  const file = path.join(dir, `${locale}.json`);
  if (!fs.existsSync(file)) {
    console.log(`${locale}.json MISSING`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const locShape = new Set(shapeKeys(data));
  const missing = [...enShape].filter((k) => !locShape.has(k));
  console.log(
    `${locale}.json`,
    fs.statSync(file).size,
    "bytes",
    countKeys(data),
    missing.length ? `MISSING ${missing.length} keys` : "structure OK"
  );
}
