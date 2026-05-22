/**
 * Post-beta paywall smoke (local or staging).
 *
 * Prerequisites:
 *   1. App running with FULL_REPORTS_FREE_DURING_BETA=false
 *   2. CHECKOUT_TOKEN_ENCRYPTION_KEY or REPORT_TOKEN_SALT (>= 32 chars) set
 *   3. Upload a CSV via /analyze, then set:
 *        SMOKE_BASE_URL=http://localhost:3000
 *        SMOKE_REPORT_ID=<uuid>
 *        SMOKE_REPORT_TOKEN=<access token from Neon if cookie path skipped>
 *
 * Run: npm run check:post-beta
 */

const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const reportId = process.env.SMOKE_REPORT_ID?.trim();
const reportToken = process.env.SMOKE_REPORT_TOKEN?.trim();

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

if (process.env.FULL_REPORTS_FREE_DURING_BETA === "true") {
  fail("Set FULL_REPORTS_FREE_DURING_BETA=false (or unset) before running post-beta smoke.");
}

const encryptionSecret =
  process.env.CHECKOUT_TOKEN_ENCRYPTION_KEY?.trim() ||
  process.env.REPORT_TOKEN_SALT?.trim();
if (!encryptionSecret || encryptionSecret.length < 32) {
  fail(
    "CHECKOUT_TOKEN_ENCRYPTION_KEY or REPORT_TOKEN_SALT must be at least 32 characters (same as Vercel prod)."
  );
}

if (!reportId || !reportToken) {
  console.log("Post-beta smoke: env checklist OK.");
  console.log("");
  console.log("Manual flow (FULL_REPORTS_FREE_DURING_BETA=false):");
  console.log("  1. Upload CSV → report opens without ?token= in the address bar (httpOnly cookie).");
  console.log("  2. Preview shows paywall sections; CSV export returns 404 until paid.");
  console.log("  3. Checkout → Polar → return URL has payment=success but no token query param.");
  console.log("  4. After webhook, full report + CSV export work in the same browser session.");
  console.log("");
  console.log("Optional automated checks: set SMOKE_REPORT_ID + SMOKE_REPORT_TOKEN and re-run.");
  process.exit(0);
}

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuid.test(reportId)) fail("SMOKE_REPORT_ID must be a UUID v4");

async function fetchStatus(path, init) {
  const res = await fetch(`${baseUrl}${path}`, init);
  return res.status;
}

const exportWithoutCookie = await fetchStatus(
  `/api/export/csv?reportId=${encodeURIComponent(reportId)}`
);
if (exportWithoutCookie !== 401 && exportWithoutCookie !== 404) {
  fail(`CSV export without auth expected 401/404, got ${exportWithoutCookie}`);
}
console.log("OK   CSV export blocked without cookie/token");

const exchangeRes = await fetch(
  `${baseUrl}/api/report/access?reportId=${encodeURIComponent(reportId)}&token=${encodeURIComponent(reportToken)}`,
  { redirect: "manual" }
);
const location = exchangeRes.headers.get("location");
if (exchangeRes.status !== 307 && exchangeRes.status !== 308) {
  fail(`Access exchange expected redirect, got ${exchangeRes.status}`);
}
if (location?.includes("token=")) {
  fail("Access exchange redirect should not include token in Location");
}
console.log("OK   /api/report/access exchanges token without leaking it in redirect URL");

const cookie = exchangeRes.headers.get("set-cookie");
if (!cookie?.includes("sfa_ra_")) {
  fail("Access exchange should set report access cookie (sfa_ra_*)");
}
console.log("OK   access cookie issued");

const reportRes = await fetch(`${baseUrl}/report/${reportId}`, {
  headers: { Cookie: cookie.split(";")[0] },
  redirect: "follow",
});
if (!reportRes.ok) {
  fail(`Report page expected 200, got ${reportRes.status}`);
}
const html = await reportRes.text();
if (!html.includes("Unlock Full Report")) {
  fail("Preview report HTML should include paywall CTA");
}
if (html.includes("Fee leak breakdown") || html.includes("Where fees leak")) {
  fail("Preview HTML should not include paid-only fee leak section");
}
console.log("OK   preview HTML shows paywall and hides paid-only sections");

console.log("");
console.log("Manual Polar + email (FULL_REPORTS_FREE_DURING_BETA=false):");
console.log("  1. Checkout → Polar sandbox → apply 100% discount code QA100 (or product test mode).");
console.log("  2. Return URL: /report/{id}?payment=success — no ?token= in address bar.");
console.log("  3. Page auto-refreshes until paid; CSV export + full sections unlock.");
console.log("  4. Resend: confirm report email to checkout address (RESEND_API_KEY + verified domain).");
console.log("");
console.log(`Post-beta smoke checks passed for ${baseUrl}`);
