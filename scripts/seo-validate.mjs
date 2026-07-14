#!/usr/bin/env node
/**
 * Static SEO checks for marketing pages — run in CI before deploy.
 * Usage: node scripts/seo-validate.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "app");

let errors = 0;
let warnings = 0;

function fail(message) {
  console.error(`  ❌ ${message}`);
  errors += 1;
}

function warn(message) {
  console.warn(`  ⚠️  ${message}`);
  warnings += 1;
}

function ok(message) {
  console.log(`  ✅ ${message}`);
}

function walkPageFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
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

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractConst(source, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`, "m");
  const match = source.match(re);
  return match?.[1] ?? null;
}

function extractMetadataTitle(source) {
  const fromConst = extractConst(source, "pageTitle") ?? extractConst(source, "title");
  if (fromConst) return fromConst;
  const metaMatch = source.match(/title:\s*[`"']([^`"']+)[`"']/);
  return metaMatch?.[1] ?? null;
}

function extractMetadataDescription(source) {
  const fromConst = extractConst(source, "pageDescription") ?? extractConst(source, "description");
  if (fromConst) return fromConst;
  const metaMatch = source.match(/description:\s*[`"']([^`"']+)[`"']/);
  return metaMatch?.[1] ?? null;
}

function extractCanonical(source) {
  const fromConst = extractConst(source, "pagePath");
  if (fromConst) return fromConst;
  const match = source.match(/canonical:\s*[`"']([^`"']+)[`"']/);
  return match?.[1] ?? null;
}

function routeFromPageFile(filePath) {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, "/");
  const parts = rel.split("/").filter((p) => p !== "page.tsx" && p !== "page.ts");
  if (parts.length === 0) return "/";
  if (parts.some((p) => p.startsWith("["))) return null;
  return `/${parts.join("/")}`;
}

function extractBlogIndexPaths() {
  const indexPath = path.join(APP_DIR, "blog", "_data", "blogIndex.ts");
  const source = readText(indexPath);
  const paths = [...source.matchAll(/path:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  return [...new Set(paths)];
}

console.log("\n🔍 SEO validate — Stripe Fee Auditor\n");

const pageFiles = walkPageFiles(APP_DIR);
ok(`Found ${pageFiles.length} page files`);

const titles = new Map();
const descriptions = new Map();
const routes = new Map();

for (const file of pageFiles) {
  const source = readText(file);
  const route = routeFromPageFile(file);
  if (!route) continue;

  routes.set(route, file);

  const title = extractMetadataTitle(source);
  const description = extractMetadataDescription(source);

  if (!title) {
    warn(`Missing detectable title: ${route} (${path.relative(ROOT, file)})`);
  } else {
    if (titles.has(title)) {
      fail(`Duplicate title "${title}" on ${route} and ${titles.get(title)}`);
    } else {
      titles.set(title, route);
    }
    if (title.length < 20 || title.length > 70) {
      warn(`Title length ${title.length} on ${route} (aim 20–70)`);
    }
  }

  if (!description) {
    warn(`Missing detectable description: ${route}`);
  } else {
    if (descriptions.has(description)) {
      warn(`Duplicate description on ${route} (also on ${descriptions.get(description)})`);
    } else {
      descriptions.set(description, route);
    }
    if (description.length < 80 || description.length > 180) {
      warn(`Description length ${description.length} on ${route} (aim 80–180)`);
    }
  }

  const canonical = extractCanonical(source);
  if (canonical && canonical !== route && !canonical.startsWith("http")) {
    if (canonical.replace(/\/$/, "") !== route.replace(/\/$/, "")) {
      warn(`Canonical ${canonical} differs from route ${route}`);
    }
  }

  if (route.startsWith("/blog/") && route !== "/blog") {
    if (source.includes("redirect(") && !source.includes("export const metadata")) {
      continue;
    }
    const hasBreadcrumb =
      source.includes("BlogBreadcrumbs") ||
      source.includes("BreadcrumbJsonLd") ||
      source.includes("BlogJsonLd");
    if (!hasBreadcrumb) {
      fail(`Blog page missing breadcrumb JSON-LD component: ${route}`);
    }
  }

  if (route.startsWith("/blog/") || route === "/why-stripe-fee-rate-higher-than-2-9") {
    const hasOg = source.includes("buildOgImageUrl") || source.includes("openGraph:");
    if (!hasOg) {
      warn(`Marketing article without OG image helper: ${route}`);
    }
  }
}

console.log("\n📚 blogIndex path coverage");
const indexPaths = extractBlogIndexPaths();
for (const indexPath of indexPaths) {
  if (!routes.has(indexPath)) {
    fail(`blogIndex path has no page.tsx: ${indexPath}`);
  }
}
ok(`Checked ${indexPaths.length} indexed paths`);

console.log("\n🗺️  sitemap source");
const sitemapPath = path.join(APP_DIR, "sitemap.ts");
if (!fs.existsSync(sitemapPath)) {
  fail("Missing app/sitemap.ts");
} else {
  const sitemapSource = readText(sitemapPath);
  if (!sitemapSource.includes("blogIndex")) {
    warn("sitemap.ts may not import blogIndex entries");
  } else {
    ok("sitemap.ts imports blog index");
  }
}

console.log(`\n${"─".repeat(50)}`);
console.log(`SEO validate: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
console.log("SEO validate passed ✅\n");
