# Stripe Fee Auditor

Upload your Stripe Balance Transactions CSV and see your **real effective fee rate**, month-over-month fee changes, and which transactions drive the rate up — without storing raw CSV on disk.

**Live:** <https://feeauditor.com>

---

## What it does

Stripe advertises **2.9% + $0.30**, but blended rates are usually higher (international cards, FX, refunds where Stripe keeps the fee, Radar, small-ticket fixed fee, etc.). The Dashboard doesn’t surface this in one clear view.

This app:

- Parses Balance CSV **in memory**, analyzes charges vs other row types, and saves **computed JSON** to Postgres (Neon).
- During the **beta**, real uploads get the **full report free** for up to **30 days**. The **Polar** paid-unlock path stays in code for **post-beta** checkout testing.
- Supports three report modes: **multi-month**, **single-month**, **low-volume** (fewer than 50 charges).

---

## How it works

1. **Upload** — User pastes/uploads CSV on `/analyze`; browser sends JSON to `POST /api/analyze`.
2. **Parse & normalize** — Papa Parse + `lib/csv-parser.ts` (USD-only for non-demo in beta); malformed rows → **422** (no silent drops).
3. **Analyze** — `lib/fee-analyzer.ts` computes volumes, blended rate, **all-in** fee lines, benchmark context, refund fee leakage, monthly breakdown, top fee drivers, and unusual charges when sample size allows.
4. **Persist** — One row in `reports` with UUID + **hashed** access token; raw CSV is **not** written to blob/disk.
5. **View** — Browser gets an **httpOnly cookie** after analyze (no token in the address bar). Email links hit `/api/report/access?reportId=&token=` once, which sets the cookie and redirects to `/report/[id]` without the token in the URL.
6. **Beta / Pay** — Beta reports are **full-access** for up to **30 days**; outside beta, `GET /api/checkout` builds Polar checkout and the signed webhook **unlocks + extends TTL**.
7. **Cleanup** — Vercel cron hits `GET /api/cron/cleanup` daily (expired reports + old rate-limit rows).

**Analytics:** Plausible on public pages plus first-party funnel events → `POST /api/event` → **server logs only** (see Privacy Policy). **No** raw CSV/report payloads are sent to analytics.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL via **Neon** (`@neondatabase/serverless`) |
| CSV | Papa Parse |
| Payments | **Polar** (checkout + signed webhooks, `@polar-sh/sdk`) |
| Email | **Resend** (transactional; optional) |
| UI | Tailwind CSS v4 + shadcn-style components + Recharts |
| Hosting | **Vercel** (serverless + cron in `vercel.json`) |
| Analytics | Plausible (privacy-oriented; CSP allows `plausible.io`) |

---

## Prerequisites

- **Node.js 20+** (recommended for Next 16)
- A **Neon** database (free tier works)
- **Polar** account — product for one-time “Full Report”, API token for dynamic checkouts, webhook secret
- **Resend** (optional — emails skipped if `RESEND_API_KEY` unset)
- **Vercel** (or compatible host) if you deploy with cron

---

## Local development

### 1. Clone and install

```bash
git clone https://github.com/Ksantor1981/Stripe-Fee-Auditor.git
cd Stripe-Fee-Auditor
npm install
```

### 2. Neon

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string (use **`sslmode=require`**).
3. Set `DATABASE_URL` in `.env.local`.

### 3. Polar

1. Create a **one-time** (or suitable) product for the Full Report.
2. Copy **Product ID** → `POLAR_PRODUCT_PRO`.
3. Create an **organization access token** with checkout read/write → `POLAR_ACCESS_TOKEN`.
4. After app is reachable, add webhook `POST https://YOUR_DOMAIN/api/webhooks/polar` and copy signing secret → `POLAR_WEBHOOK_SECRET`.

Old static checkout-link variables such as `POLAR_CHECKOUT_*` are not used by the current flow. Keep checkout creation server-side through `POLAR_ACCESS_TOKEN` so report access tokens never have to be embedded in Polar checkout URLs.

### 4. Resend (optional)

1. Create API key → `RESEND_API_KEY`.
2. Set `EMAIL_FROM` (verified domain in production).
3. Set `EMAIL_REPLY_TO` / `NEXT_PUBLIC_CONTACT_EMAIL` as needed.

### 5. Environment variables

Copy `.env.example` to `.env.local` and fill values (see repo root — ignored paths may hide it in some tools; variable names match sections below).

**Required for core flows**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres (`sslmode=require`) |
| `POLAR_WEBHOOK_SECRET` | Webhook signature verification |
| `POLAR_PRODUCT_PRO` | Allowed product UUID at checkout/webhook |
| `POLAR_ACCESS_TOKEN` | Dynamic checkout URLs + checkout metadata recovery |
| `CHECKOUT_TOKEN_ENCRYPTION_KEY` | **Required in production.** Encrypts checkout-session tokens and httpOnly report-access cookies. At least 32 random characters. If unset, `REPORT_TOKEN_SALT` (also ≥32 chars) is used as fallback — set one of them on Vercel or checkout/cookies will fail at runtime. |
| `CRON_SECRET` | Bearer secret for `/api/cron/cleanup` |
| `NEXT_PUBLIC_BASE_URL` | Canonical URL (sitemap, metadata, email links) — e.g. `http://localhost:3000` locally |

**Optional / recommended**

| Variable | Purpose |
|----------|---------|
| `FULL_REPORTS_FREE_DURING_BETA` | Set `true` only during beta to show full reports and exports without payment; beta reports are retained up to 30 days |
| `RESEND_API_KEY` | Send report link after payment |
| `EMAIL_FROM` | From header (domain verified in Resend for prod) |
| `EMAIL_REPLY_TO` | Reply-To |
| `FEEDBACK_TO` | Where report feedback form submissions are delivered; defaults to support contact email |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Legal/support footer |
| `NEXT_PUBLIC_REPORTS_ANALYZED_COUNT` | Optional landing-page social proof count; leave empty if you do not have a real number yet |
| `REPORT_TOKEN_SALT` | Pepper for access-token hashing (recommended in prod). May double as encryption secret if `CHECKOUT_TOKEN_ENCRYPTION_KEY` is unset (must still be ≥32 characters). |
| `NEXT_PUBLIC_OPERATOR_NAME`, `JURISDICTION`, `ADDRESS` | Optional legal footer on Privacy/Terms |

**Remove from Vercel if still present**

| Variable | Why |
|----------|-----|
| `POLAR_CHECKOUT_BASIC`, `POLAR_CHECKOUT_PRO`, `POLAR_CHECKOUT_TEAM` | Old static checkout-link fallback; current checkout is dynamic via `POLAR_ACCESS_TOKEN` |
| `LEMONSQUEEZY_*` | Legacy provider variables from the pre-Polar integration |

### 6. Initialize database

Schema is applied with a one-off script (no Prisma migrations in this repo):

```bash
node scripts/init-db.mjs
```

### 7. Run dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

### 8. Polar webhook (local)

Expose your app (e.g. `ngrok`) or test webhooks on a deployed preview. Webhook handler expects **raw body** for signature verification (do not swap `request.text()` for `.json()` in `app/api/webhooks/polar/route.ts`).

### 9. Test cron cleanup

```bash
curl -sS "http://localhost:3000/api/cron/cleanup" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set **all** env vars for Production (and Preview if needed).
3. Configure **Polar** webhook to `https://feeauditor.com/api/webhooks/polar` (or your domain). Enable events handled in code: **`order.paid`**, **`order.created`**, **`checkout.updated`**.
4. Cron is declared in `vercel.json`: **`/api/cron/cleanup`** at **`0 0 * * *`** (daily midnight UTC). Set `CRON_SECRET`; Vercel sends `Authorization: Bearer …` automatically for cron invocations.
5. **`www` → apex:** `vercel.json` redirects `www.feeauditor.com` → `feeauditor.com`.
6. After deploy: verify `NEXT_PUBLIC_BASE_URL`, `/sitemap.xml`, `/robots.txt`. Checkout compliance links: `/privacy`, `/terms`, `/refund`.
7. Run `npm run check:prod` to confirm production is serving the current landing copy, sitemap, and robots file.
8. Before turning off beta, run locally with `FULL_REPORTS_FREE_DURING_BETA=false` and `npm run check:post-beta` (see script for manual paywall checklist).

**Vercel production secrets (do not skip)**

- `CHECKOUT_TOKEN_ENCRYPTION_KEY` **or** `REPORT_TOKEN_SALT` — minimum **32 characters** (generate with `openssl rand -base64 32`).
- Without this, encrypted checkout rows and report-access cookies throw at runtime.

**Production email (short checklist)**

- Vercel: `NEXT_PUBLIC_BASE_URL`, `EMAIL_FROM` (verified sender).
- Resend: domain DNS (SPF/DKIM); optional DMARC TXT `_dmarc`.

---

## Project structure

```text
├── app/
│   ├── page.tsx                    Landing
│   ├── analyze/                    CSV upload + instructions
│   ├── report/[id]/                Report UI (+ print subroute)
│   ├── api/
│   │   ├── analyze/route.ts        Parse CSV → analyze → save report
│   │   ├── checkout/route.ts       Polar redirect (validated report + token)
│   │   ├── cron/cleanup/route.ts   Expired rows + rate_limits cleanup
│   │   ├── event/route.ts          First-party funnel → logs
│   │   ├── export/csv/route.ts     Paid or beta CSV export
│   │   ├── reports/[id]/email/     Email gate + Resend
│   │   └── webhooks/polar/route.ts Polar signature verify → unlock + email
│   ├── blog/                       SEO articles
│   ├── privacy/, terms/, refund/   Legal
│   └── layout.tsx                  Root layout + Plausible
├── components/                     Shared UI (shadcn-style)
├── lib/
│   ├── csv-parser.ts               Stripe row normalization
│   ├── fee-analyzer.ts             Metrics, anomalies, savings copy
│   ├── db.ts                       Neon SQL + report CRUD + rate limits + webhook idempotency
│   ├── polar.ts                    Checkout URL + webhook verify helpers
│   ├── email.ts                    Resend transactional email
│   ├── analyze-input.ts            Row cap + column-mapping sanitization
│   ├── cron-bearer.ts              Timing-safe cron auth
│   └── …
├── scripts/
│   └── init-db.mjs                 Creates tables (run once per DB)
├── tests/                          tsx smoke tests (pipeline + security helpers)
├── docs/
│   └── TECH_SPEC.md                Product/technical spec
├── next.config.ts                  CSP, security headers
└── vercel.json                     Cron + www redirect
```

---

## Database schema

| Table | Role |
|-------|------|
| **reports** | One row per analysis: `result` JSONB, `access_token_hash`, `is_paid`, `email`, `expires_at`, etc. |
| **rate_limits** | IP-scoped counters for analyze / sample / email / checkout quotas |
| **webhook_events** | Polar event idempotency (`id` primary key) |

Full column list and behaviors: see **`scripts/init-db.mjs`** and **`README`** historical notes in `docs/TECH_SPEC.md`.

---

## Key implementation notes

- **No raw CSV persistence** — only derived analysis JSON in `reports.result`.
- **Polar webhook** — verify with SDK/`validateEvent` using **raw body string**; return **500** on retryable DB/report errors so Polar retries.
- **Access control** — report URLs use high-entropy token; hash stored with optional `REPORT_TOKEN_SALT`. `Referrer-Policy: same-origin` reduces token leakage via Referer; URLs still appear in logs/history.
- **Checkout token isolation** — dynamic Polar checkout sessions store report access on our side for a short time and no longer send the report bearer token in Polar metadata.
- **Rate limits** — enforced in Neon with advisory locks per IP key (`lib/db.ts`); analyze **10**/IP/day (real CSV), sample **20**/IP/day.
- **USD-only (beta)** — non-sample CSV with non-USD currencies → **422**.
- **CSP** — `script-src` / `connect-src` allow Plausible plus first-party app/API traffic and required payment/email flows.

---

## Rate limiting (summary)

| Endpoint / flow | Limit (per IP / day unless noted) |
|-----------------|-------------------------------------|
| Real CSV analyze | 10 |
| Demo sample analyze | 20 |
| Email gate POST | 10 |
| Checkout redirect | 30 (after valid report + token) |
| Client funnel POST `/api/event` | 120 |

`rate_limits` rows older than ~2 days removed by cron.

---

## What this is **not**

- Not bank reconciliation.
- Not financial or tax advice.
- Not guaranteed identical to every Stripe internal calculation — depends on export correctness.
- Not a full replacement for Stripe Dashboard; it’s an aggregation/lens on Balance CSV.

---

## Contributing

Pull requests are welcome. For larger changes, open an issue first.

1. Fork / branch: `git checkout -b feature/your-change`
2. Run `npm run lint` and relevant tests under `tests/` (`npx tsx tests/...`).
3. Open a PR with a clear description.

---

## License

Specify in the repository root if you add a `LICENSE` file; until then, rights remain with the project owner.
