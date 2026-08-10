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
 * The first run creates a Polar checkout. After completing it in sandbox,
 * re-run with SMOKE_CHECKOUT_ID to verify paid confirmation, report access,
 * paywall removal, and CSV export end to end.
 *
 * Monitor sandbox (manual, after POLAR_SERVER=sandbox):
 *   1. POST /api/checkout/monitor → complete Polar sandbox checkout
 *   2. Return URL → /monitor?payment=success with onboarding panel
 *   3. Welcome email + upload CTA on /monitor
 */

const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const reportId = process.env.SMOKE_REPORT_ID?.trim();
const reportToken = process.env.SMOKE_REPORT_TOKEN?.trim();
const checkoutId = process.env.SMOKE_CHECKOUT_ID?.trim();

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

if (!checkoutId) {
  const checkoutRes = await fetch(
    `${baseUrl}/api/checkout?plan=pro&reportId=${encodeURIComponent(reportId)}`,
    {
      headers: { Cookie: cookie.split(";")[0] },
      redirect: "manual",
    }
  );
  const checkoutLocation = checkoutRes.headers.get("location");
  if (checkoutRes.status !== 307 && checkoutRes.status !== 308) {
    fail(`Checkout start expected redirect, got ${checkoutRes.status}`);
  }
  if (!checkoutLocation || !/^https:\/\//.test(checkoutLocation)) {
    fail("Checkout start should redirect to an HTTPS Polar checkout URL");
  }
  console.log("OK   checkout session created and redirected to Polar");
  console.log("");
  console.log("Complete the Polar sandbox checkout, then re-run with:");
  console.log("  SMOKE_CHECKOUT_ID=<completed checkout id>");
  console.log(`  Checkout URL: ${checkoutLocation}`);
  console.log("");
  console.log("The next run will verify checkout confirmation, paid HTML, and paid CSV export.");
  process.exit(0);
}

const successRes = await fetch(
  `${baseUrl}/api/checkout/success?checkout_id=${encodeURIComponent(checkoutId)}`,
  { redirect: "manual" }
);
if (successRes.status !== 307 && successRes.status !== 308) {
  fail(`Checkout success expected redirect, got ${successRes.status}`);
}
const successLocation = successRes.headers.get("location");
if (!successLocation?.includes(`/report/${reportId}`) || !successLocation.includes("payment=success")) {
  fail(`Checkout success redirected to an unexpected location: ${successLocation ?? "missing"}`);
}
if (successLocation.includes("token=")) {
  fail("Checkout success redirect should not expose a report token");
}

const paidCookie = successRes.headers.get("set-cookie");
if (!paidCookie?.includes("sfa_ra_")) {
  fail("Checkout success should restore the private report cookie");
}
console.log("OK   succeeded checkout confirmed and report cookie restored");

const paidCookieHeader = paidCookie.split(";")[0];
const paidReportRes = await fetch(`${baseUrl}/report/${reportId}`, {
  headers: { Cookie: paidCookieHeader },
  redirect: "follow",
});
if (!paidReportRes.ok) {
  fail(`Paid report expected 200, got ${paidReportRes.status}`);
}
const paidHtml = await paidReportRes.text();
if (paidHtml.includes("Unlock Full Report")) {
  fail("Paid report still contains the paywall CTA");
}
console.log("OK   paid report renders without the paywall");

const paidExportRes = await fetch(
  `${baseUrl}/api/export/csv?reportId=${encodeURIComponent(reportId)}`,
  { headers: { Cookie: paidCookieHeader } }
);
if (!paidExportRes.ok) {
  fail(`Paid CSV export expected 200, got ${paidExportRes.status}`);
}
if (!paidExportRes.headers.get("content-type")?.includes("text/csv")) {
  fail("Paid export did not return CSV content");
}
console.log("OK   paid CSV export is unlocked");
console.log("");
console.log(`Full post-beta payment flow passed for ${baseUrl}`);
