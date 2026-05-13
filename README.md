# Stripe Fee Auditor

Upload your Stripe Balance Transactions CSV and see your **real effective fee rate**, month-over-month fee changes, and which transactions drive the rate up — without storing raw CSV on disk.

**Live:** https://feeauditor.com

---

## What it does

Stripe advertises **2.9% + $0.30**, but blended rates are usually higher (international cards, FX, refunds where Stripe keeps the fee, Radar, small-ticket fixed fee, etc.). The Dashboard doesn’t surface this in one clear view.

This app:

- Parses Balance CSV **in memory**, analyzes charges vs other row types, and saves **computed JSON** to Postgres (Neon).
- Shows **free preview** (summary + top fee drivers); **one-time paid unlock** (Polar) adds full anomalies, savings hints, monthly detail, CSV export, and print view.
- Supports three report modes: **multi-month**, **single-month**, **low-volume** (fewer than 50 charges).

---

## How it works

1. **Upload** — User pastes/uploads CSV on `/analyze`; browser sends JSON to `POST /api/analyze`.
2. **Parse & normalize** — Papa Parse + `lib/csv-parser.ts` (USD-only for non-demo in beta); malformed rows → **422** (no silent drops).
3. **Analyze** — `lib/fee-analyzer.ts` computes volumes, blended rate, monthly breakdown, anomalies (when sample size allows).
4. **Persist** — One row in `reports` with UUID + **hashed** access token; raw CSV is **not** written to blob/disk.
5. **View** — Client opens `/report/[id]?token=…` (secret link).
6. **Pay** — `GET /api/checkout` builds Polar checkout with metadata; webhook verifies signature and unlocks report + extends TTL.
7. **Cleanup** — Vercel cron hits `GET /api/cron/cleanup` daily (expired reports + old rate-limit rows).

**Analytics:** Plausible on public pages (`app/layout.tsx`); first-party funnel events → `POST /api/event` → server logs only (see Privacy Policy).

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
5. Optionally set `POLAR_CHECKOUT_PRO` static slug if you run **without** `POLAR_ACCESS_TOKEN` (fallback only).

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
| `CRON_SECRET` | Bearer secret for `/api/cron/cleanup` |
| `NEXT_PUBLIC_BASE_URL` | Canonical URL (sitemap, metadata, email links) — e.g. `http://localhost:3000` locally |

**Optional / recommended**

| Variable | Purpose |
|----------|---------|
| `POLAR_CHECKOUT_PRO` | Static Polar checkout path fallback |
| `RESEND_API_KEY` | Send report link after payment |
| `EMAIL_FROM` | From header (domain verified in Resend for prod) |
| `EMAIL_REPLY_TO` | Reply-To |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Legal/support footer |
| `REPORT_TOKEN_SALT` | Pepper for access-token hashing (recommended in prod) |

### 6. Initialize database

Schema is applied with a one-off script (no Prisma migrations in this repo):

```bash
node scripts/init-db.mjs
```

### 7. Run dev server

```bash
npm run dev
```

Open http://localhost:3000.

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
│   │   ├── export/csv/route.ts     Paid CSV export
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
- **Rate limits** — enforced in Neon with advisory locks per IP key (`lib/db.ts`); analyze **10**/IP/day (real CSV), sample **20**/IP/day.
- **USD-only (beta)** — non-sample CSV with non-USD currencies → **422**.
- **CSP** — `connect-src` includes `'self'` and `https://plausible.io` for analytics.

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
