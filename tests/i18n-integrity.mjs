import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["de", "es", "fr", "hi", "ru"];
const PARTIALS = ["ui", "report", "legal", "chromeExtension"];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function collectStrings(value, currentPath = "", output = []) {
  if (typeof value === "string") {
    output.push([currentPath, value]);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${currentPath}[${index}]`, output));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      collectStrings(item, currentPath ? `${currentPath}.${key}` : key, output);
    }
  }
  return output;
}

function assertBundle(base, localized, label) {
  function assertRequiredShape(required, actual, currentPath = "") {
    if (Array.isArray(required)) {
      assert(Array.isArray(actual), `${label}.${currentPath}: expected array`);
      return;
    }
    if (required && typeof required === "object") {
      assert(actual && typeof actual === "object" && !Array.isArray(actual), `${label}.${currentPath}: expected object`);
      for (const [key, value] of Object.entries(required)) {
        assert(Object.hasOwn(actual, key), `${label}.${currentPath ? `${currentPath}.` : ""}${key}: missing key`);
        assertRequiredShape(value, actual[key], currentPath ? `${currentPath}.${key}` : key);
      }
      return;
    }
    assert.equal(typeof actual, typeof required, `${label}.${currentPath}: value type differs from English`);
  }

  assertRequiredShape(base, localized);
  const baseStrings = new Map(collectStrings(base));
  for (const [key, value] of collectStrings(localized)) {
    if (value.trim() === "") {
      assert.equal(baseStrings.get(key), "", `${label}.${key}: empty translation`);
    }
    assert(!/^(?:chromeExtension|pricing|footer|seo\.vsSquare)\.[A-Za-z0-9_.-]+$/.test(value), `${label}.${key}: leaked message key`);
  }
}

const englishPages = readJson("messages/pages/en.json");
const groups = [
  ["core", readJson("messages/en.json"), (locale) => readJson(`messages/${locale}.json`)],
  [
    "pages:vsSquare",
    { seo: { vsSquare: englishPages.seo.vsSquare } },
    (locale) => ({ seo: { vsSquare: readJson(`messages/pages/${locale}.json`).seo.vsSquare } }),
  ],
  ...PARTIALS.map((name) => [
    `partial:${name}`,
    readJson(`messages/partials/en/${name}.json`),
    (locale) => readJson(`messages/partials/${locale}/${name}.json`),
  ]),
];

for (const [group, base, loadLocalized] of groups) {
  for (const locale of LOCALES) {
    assertBundle(base, loadLocalized(locale), `${group}/${locale}`);
  }
}

const chromePage = fs.readFileSync(path.join(ROOT, "app/chrome-extension/page.tsx"), "utf8");
const pricingPage = fs.readFileSync(path.join(ROOT, "app/pricing/page.tsx"), "utf8");
const localizedSeoPage = fs.readFileSync(path.join(ROOT, "components/marketing/LocalizedSeoPage.tsx"), "utf8");
const seoSectionsRenderer = fs.readFileSync(path.join(ROOT, "components/marketing/SeoSectionsRenderer.tsx"), "utf8");
assert(!chromePage.includes("When the Chrome helper is useful"), "Chrome page contains hardcoded English copy");
assert(!pricingPage.includes("FeeAuditor is currently free."), "Pricing page contains hardcoded English copy");
assert(!localizedSeoPage.includes(">FAQ<"), "Localized SEO page contains hardcoded FAQ heading");
for (const hardcoded of ["Use case", "Alternative", "Decision", "Good fit", "Poor fit", "Audit my actual Stripe CSV", "Start with a quick estimate"]) {
  assert(!seoSectionsRenderer.includes(`>${hardcoded}<`), `SEO renderer contains hardcoded English: ${hardcoded}`);
}

const extensionEnglish = readJson("chrome-extension/_locales/en/messages.json");
for (const locale of LOCALES) {
  const localized = readJson(`chrome-extension/_locales/${locale}/messages.json`);
  assert.deepEqual(
    Object.keys(localized).sort(),
    Object.keys(extensionEnglish).sort(),
    `chrome-extension/${locale}: locale key set differs from English`,
  );
  for (const [key, entry] of Object.entries(localized)) {
    assert.equal(typeof entry?.message, "string", `chrome-extension/${locale}.${key}: missing message`);
    assert.notEqual(entry.message.trim(), "", `chrome-extension/${locale}.${key}: empty message`);
    assert(!/__PH\d+__|ZZFA\d+ZZ|ZZZZFEESPLIT/.test(entry.message), `chrome-extension/${locale}.${key}: leaked token`);
  }
}

console.log("i18n integrity tests passed");
