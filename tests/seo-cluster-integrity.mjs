import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

const CALCULATOR_ALIASES = [
  "/stripe-fees-calculator",
  "/calculate-stripe-fees",
  "/stripe-processing-fee-calculator",
  "/stripe-fee-calculator-2",
];

const CLUSTER = {
  calculator: "/stripe-fee-calculator",
  percent: "/what-percent-does-stripe-take",
  article: "/blog/stripe-credit-card-processing-fees",
  analyze: "/analyze",
};

const pages = readJson("messages/pages/en.json");
const calculator = pages.seo.stripeFeeCalculator;
const percent = pages.seo.whatPercent;
const article = pages.blog["stripe-credit-card-processing-fees"];
const sitemapSource = read("app/sitemap.ts");
const blogIndex = read("app/blog/_data/blogIndex.ts");
const appDir = path.join(ROOT, "app");

function walkPageFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name === "api") continue;
      walkPageFiles(full, acc);
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      acc.push(full);
    }
  }
  return acc;
}

const routes = walkPageFiles(appDir).map((file) => {
  const rel = path.relative(appDir, file).replace(/\\/g, "/");
  const parts = rel.split("/").filter((p) => p !== "page.tsx" && p !== "page.ts");
  return parts.length === 0 ? "/" : `/${parts.join("/")}`;
});

for (const alias of CALCULATOR_ALIASES) {
  assert(!routes.includes(alias), `duplicate calculator route exists: ${alias}`);
}

assert(routes.includes(CLUSTER.calculator), "missing calculator page");
assert(routes.includes(CLUSTER.percent), "missing percent page");
assert(routes.includes(CLUSTER.article), "missing processing-fees article");
assert(routes.includes(CLUSTER.analyze), "missing analyze page");

assert.match(calculator.metaTitle, /Stripe Fee Calculator/i);
assert.match(calculator.heroTitle, /Stripe Fee Calculator/i);
assert.match(JSON.stringify(calculator.faq), /How do I calculate Stripe fees/);
assert.match(JSON.stringify(calculator.faq), /Stripe processing fee calculator/);
assert.doesNotMatch(
  JSON.stringify(calculator.faq),
  /What file do I need to calculate my Stripe effective fee rate/,
);

const calculatorHrefs = JSON.stringify(calculator.sections);
assert(calculatorHrefs.includes(CLUSTER.analyze), "calculator missing /analyze link");
assert(calculatorHrefs.includes(CLUSTER.percent), "calculator missing percent link");
assert(calculatorHrefs.includes(CLUSTER.article), "calculator missing article link");
assert(calculatorHrefs.includes("https://stripe.com/pricing"), "calculator missing Stripe pricing source");

assert.match(percent.metaTitle, /What Percent Does Stripe Take/i);
assert.match(percent.heroTitle, /What Percent Does Stripe Take/i);
assert.match(JSON.stringify(percent.faq), /What percent does Stripe take/);
assert.match(JSON.stringify(percent.faq), /What percentage does Stripe take/);
assert.match(JSON.stringify(percent.sections), /August 19, 2026/);
assert(JSON.stringify(percent.sections).includes(CLUSTER.calculator), "percent missing calculator link");
assert(JSON.stringify(percent.sections).includes(CLUSTER.analyze), "percent missing /analyze link");
assert(JSON.stringify(percent.sections).includes(CLUSTER.article), "percent missing article link");

assert(JSON.stringify(article.intro).includes(CLUSTER.calculator), "article intro missing calculator link");
assert(JSON.stringify(article.intro).includes(CLUSTER.analyze), "article intro missing /analyze link");
assert(JSON.stringify(article.intro).includes("https://stripe.com/pricing"), "article missing Stripe pricing source");
assert(
  article.related.some((link) => link.href === CLUSTER.analyze),
  "article related missing /analyze",
);
assert(
  article.related.some((link) => link.href === CLUSTER.calculator),
  "article related missing calculator",
);
assert(
  article.related.some((link) => link.href === CLUSTER.percent),
  "article related missing percent page",
);

const calculatorPage = read("app/stripe-fee-calculator/page.tsx");
assert(calculatorPage.includes('canonical') || calculatorPage.includes("seoPageMetadata"), "calculator missing canonical helper");
assert(calculatorPage.includes('"WebApplication"'), "calculator missing WebApplication JSON-LD");
assert(calculatorPage.includes('"HowTo"'), "calculator missing HowTo JSON-LD");
assert(calculatorPage.includes('"Article"'), "calculator missing Article JSON-LD");
assert(!calculatorPage.includes("hreflang"), "calculator added hreflang");

const percentPage = read("app/what-percent-does-stripe-take/page.tsx");
assert(percentPage.includes("relatedKey=\"percentTake\""), "percent page missing relatedKey");
assert(percentPage.includes('"Article"'), "percent missing Article JSON-LD");
assert(!percentPage.includes("StripeFeeMiniEstimate"), "percent page embeds calculator widget");
assert(!percentPage.includes("StripeTakeCalculator"), "percent page embeds take calculator");

const analyzePage = read("app/analyze/page.tsx");
assert(analyzePage.includes('canonical: "/analyze"'), "analyze missing canonical");
assert(analyzePage.includes('"WebApplication"'), "analyze missing WebApplication JSON-LD");
assert(analyzePage.includes('href="/stripe-fee-calculator"'), "analyze missing calculator link");
assert(analyzePage.includes('href="/what-percent-does-stripe-take"'), "analyze missing percent link");
assert(analyzePage.includes('href="/blog/stripe-credit-card-processing-fees"'), "analyze missing article link");

assert(sitemapSource.includes("SEO_LANDING_ENTRIES"), "sitemap missing landing entries");
assert(blogIndex.includes('path: "/stripe-fee-calculator"'), "blogIndex missing calculator");
assert(blogIndex.includes('path: "/what-percent-does-stripe-take"'), "blogIndex missing percent");
assert(blogIndex.includes('path: "/blog/stripe-credit-card-processing-fees"'), "blogIndex missing article");
assert.match(blogIndex, /updatedAt: "2026-08-19"/);

const proxy = read("proxy.ts");
assert(!proxy.includes("hreflang"), "proxy.ts should not gain hreflang in this sprint");

console.log("seo cluster integrity tests passed");
