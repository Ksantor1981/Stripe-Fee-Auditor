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

function restructureLocale(locale) {
  const file = path.join(ROOT, "messages/pages", `${locale}.json`);
  if (!fs.existsSync(file)) return null;
  const old = JSON.parse(fs.readFileSync(file, "utf8"));
  const out = JSON.parse(JSON.stringify(EN));

  // SEO: keep translated seo blocks when keys match
  for (const key of Object.keys(out.seo)) {
    if (old.seo?.[key]) out.seo[key] = old.seo[key];
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
