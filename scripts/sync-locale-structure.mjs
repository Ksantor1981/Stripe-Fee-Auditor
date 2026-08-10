/**
 * Ensures locale page JSON files match en.json structure.
 * Preserves existing translations; fills missing keys from English.
 * Run after: node scripts/extract-pages-en.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "messages", "pages");
const LOCALES = ["es", "de", "fr", "hi", "ru"];

function deepMergeEn(enVal, locVal) {
  if (Array.isArray(enVal)) {
    if (!Array.isArray(locVal) || locVal.length !== enVal.length) return enVal;
    return enVal.map((item, i) => deepMergeEn(item, locVal[i]));
  }
  if (enVal && typeof enVal === "object") {
    const locObj = locVal && typeof locVal === "object" && !Array.isArray(locVal) ? locVal : {};
    const out = {};
    for (const key of Object.keys(enVal)) {
      out[key] = deepMergeEn(enVal[key], locObj[key]);
    }
    return out;
  }
  return locVal !== undefined && locVal !== null ? locVal : enVal;
}

const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));

for (const locale of LOCALES) {
  const file = path.join(dir, `${locale}.json`);
  let existing = {};
  if (fs.existsSync(file)) {
    try {
      existing = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      existing = {};
    }
  }
  const merged = {
    seo: deepMergeEn(en.seo, existing.seo),
    blog: deepMergeEn(en.blog, existing.blog),
    privacy: deepMergeEn(en.privacy, existing.privacy),
  };
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(
    locale,
    fs.statSync(file).size,
    "bytes",
    "seo",
    Object.keys(merged.seo).length,
    "blog",
    Object.keys(merged.blog).length,
    "privacy",
    Object.keys(merged.privacy).length
  );
}
