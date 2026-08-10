/**
 * Restructure locale page JSON to match en.json keys (hyphenated blog/privacy slugs).
 * Preserves existing translations from camelCase blog keys.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const EN = JSON.parse(fs.readFileSync(path.join(ROOT, "messages/pages/en.json"), "utf8"));

function slugToCamelKey(slug) {
  const parts = slug.split("-");
  return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function deepMergeEnBase(localized, english) {
  if (Array.isArray(localized)) {
    return localized.length ? localized : english;
  }
  if (localized && typeof localized === "object" && english && typeof english === "object") {
    const out = { ...english, ...localized };
    for (const k of Object.keys(english)) {
      if (Array.isArray(english[k]) && Array.isArray(localized[k]) && localized[k].length === 0) {
        out[k] = english[k];
      } else if (localized[k] && typeof localized[k] === "object" && english[k]) {
        out[k] = deepMergeEnBase(localized[k], english[k]);
      }
    }
    return out;
  }
  return localized ?? english;
}

function restructureLocale(locale) {
  const file = path.join(ROOT, "messages/pages", `${locale}.json`);
  if (!fs.existsSync(file)) return null;
  const old = JSON.parse(fs.readFileSync(file, "utf8"));
  const out = JSON.parse(JSON.stringify(EN));

  // SEO: deep-merge — keep translations, fill empty arrays/objects from en
  for (const key of Object.keys(out.seo)) {
    if (!old.seo?.[key]) continue;
    out.seo[key] = deepMergeEnBase(old.seo[key], out.seo[key]);
  }

  // Blog: map hyphen slug -> camelCase legacy key
  for (const slug of Object.keys(out.blog)) {
    const camel = slugToCamelKey(slug);
    const translated = old.blog?.[slug] ?? old.blog?.[camel];
    if (translated) out.blog[slug] = translated;
  }

  // Privacy: from privacy root or legacy blog camel keys
  for (const slug of Object.keys(out.privacy)) {
    const camel = slugToCamelKey(slug);
    const translated = old.privacy?.[slug] ?? old.blog?.[camel] ?? old.privacy?.[camel];
    if (translated) out.privacy[slug] = translated;
  }

  fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  return file;
}

for (const locale of ["es", "de", "fr", "hi", "ru"]) {
  const f = restructureLocale(locale);
  if (f) console.log("Restructured", f, fs.statSync(f).size, "bytes");
}
