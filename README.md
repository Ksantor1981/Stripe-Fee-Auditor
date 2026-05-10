Stripe Fee Auditor
Upload your Stripe Balance CSV — see your real effective fee rate, monthly fee changes, and which transactions are driving them up.
Live: <https://feeauditor.com>

What it does
Stripe charges 2.9% + $0.30 by default, but your actual effective rate is usually higher. International cards, currency conversion, refunds (where Stripe keeps the fee), and Radar fees all push it up — and Stripe Dashboard doesn't aggregate this clearly.
This tool takes your Balance Transactions CSV export and shows:

Your effective fee rate for the period (charge fees only, separated from other fees)
Month-over-month fee change in dollars
Which specific transactions have the highest fee rate and why

Three result modes depending on the data:

multi-month — 2+ months: shows MoM trend and delta
single — 1 month: shows breakdown without trend
low-volume — under 50 charges: shows top 5 by fee rate, skips anomaly detection (std dev is noisy on small samples)

Freemium model: free tier shows summary + top 3 fee drivers. The one-time Full Report unlock shows full anomalies, savings opportunities, monthly detail, CSV export, and print-ready report via Polar.

How it works
User uploads CSV in browser
  → CSV text sent to POST /api/analyze
  → Parsed, normalized, analyzed in memory (never written to disk)
  → Result saved to Neon DB with UUID + hashed access token
  → reportId + accessToken returned to client
  → Client opens /report/[id]?token=...
  → Paid features unlocked via Polar webhook after signature verification, product id, report metadata, and idempotent event handling
CSV is not stored anywhere. Free previews expire in 1 hour; paid report access is extended to 30 days.

Key files
app/api/analyze/route.ts      — main endpoint: parse CSV, run analysis, save result
app/api/webhooks/polar — verify signature, mark report paid, send email
app/api/cron/cleanup/route.ts — delete expired reports + rate_limit rows (runs daily on Hobby plan)
lib/csv-parser.ts             — normalize raw CSV rows (amounts ÷100, dates, types)
lib/fee-analyzer.ts           — all business logic: metrics, anomalies, period comparison
lib/db.ts                     — Neon SQL client + all DB operations
lib/polar.ts                  — Polar checkout URL builder + webhook verification (@polar-sh/sdk)
lib/email.ts                  — send report link email after payment (via Resend)
If you change the analysis logic — lib/fee-analyzer.ts is the only place to touch.
If Stripe changes their CSV format — lib/csv-parser.ts is where to fix column mapping.

Environment variables
DATABASE_URL=                     # Neon PostgreSQL connection string (sslmode=require)
POLAR_WEBHOOK_SECRET=             # Polar dashboard → Webhooks (signing secret)
POLAR_PRODUCT_PRO=                # Product UUID for the one-time Full Report ($12)
POLAR_ACCESS_TOKEN=               # Polar API token with checkouts:write + checkouts:read; used for dynamic checkout redirects and webhook metadata recovery
POLAR_CHECKOUT_PRO=               # Optional static fallback checkout link slug/path
CRON_SECRET=                      # any random string — protects /api/cron/cleanup from public calls
RESEND_API_KEY=                   # from resend.com — used to email report link after payment
EMAIL_FROM=                       # production: Fee Auditor <noreply@feeauditor.com> (domain must be verified in Resend)
EMAIL_REPLY_TO=support@feeauditor.com
NEXT_PUBLIC_BASE_URL=             # production: https://feeauditor.com — drives metadataBase, sitemap, robots, email links
NEXT_PUBLIC_CONTACT_EMAIL=support@feeauditor.com
REPORT_TOKEN_SALT=                # optional pepper for access-token hashing (recommended: 32+ random chars in prod)

All required except RESEND_API_KEY and POLAR_CHECKOUT_PRO (email is skipped if not set — report still unlocks; static checkout link is only a fallback when POLAR_ACCESS_TOKEN is unavailable).
App will throw on missing DATABASE_URL or required Polar product env vars at checkout / webhook verify time.

Rate limiting
10 free analyses per IP per day. Demo sample reports have a separate 20/day/IP limit. Email-gate sends are limited to 10/day/IP. Tracked in rate_limits table in Neon.
Up to 30 `/api/checkout` redirects per IP per day (separate key `checkout:<ip>`), counted only after report + token validate — limits checkout noise without burning quota on bad IDs.
Old entries cleaned up by cron (runs daily at midnight, deletes rows older than 2 days).
If IP is missing or the literal `unknown` — request is rejected with 400.

Security notes
- CSP and related headers: `next.config.ts`.
- `Referrer-Policy: same-origin` reduces leaking `?token=` via Referer on cross-origin clicks; tokens in URLs still appear in server logs and browser history — POST/cookie-based access is a future hardening.
- Polar webhook returns **500** on DB errors so payments can retry safely.
- Set **REPORT_TOKEN_SALT** in production for stronger token hashes (omit or empty = legacy SHA256(token) only).
- Max CSV upload **4 MB** (UTF-8) so JSON+CSV fits under Vercel’s **~4.5 MB** function body cap; use a shorter Stripe date range if the export is larger.
- Hard cap on **parsed CSV rows** per analyze request (see `MAX_CSV_ROWS` in `lib/analyze-input.ts`) to bound CPU/memory.
- `/api/analyze` expects **`Content-Type: application/json`**; column remap payloads are sanitized (dangerous keys dropped; allowlisted Stripe columns only).
- **USD-only (beta):** non-sample uploads with currencies other than **USD** return **422**; demo/sample CSV is exempt.
- If **any** parsed CSV rows fail normalization, the API returns **422** (financial reports must not silently drop rows).
- Cron cleanup (`/api/cron/cleanup`) verifies **`Authorization: Bearer`** via timing-safe compare (`lib/cron-bearer.ts`).

DB schema
Three tables:

reports — one row per analysis
  id          uuid primary key (v4, generated by DB)
  access_token_hash text     -- SHA-256 hash of access token (optional REPORT_TOKEN_SALT pepper)
  result      jsonb          -- full analysis output
  is_paid     boolean        -- unlocked by Polar webhook
  email       text           -- set when paid
  paid_at     timestamptz
  expires_at  timestamptz    -- 1 hour for free previews, extended to 30 days after payment
  created_at  timestamptz

rate_limits — one row per IP per request
  ip          text
  created_at  timestamptz

webhook_events — payment webhook idempotency guard
  id          text primary key
  event_name  text
  created_at  timestamptz

No migrations tool — schema created by scripts/init-db.mjs.
Run once: node scripts/init-db.mjs

Deploy
Vercel + Neon + Polar. No Docker, no separate backend.

npm install
cp .env.example .env.local  # fill in all values
node scripts/init-db.mjs    # create DB tables (once)
npm run dev

Cron (/api/cron/cleanup) runs daily at midnight on Vercel Hobby plan.
Requires CRON_SECRET in env — Vercel sends it automatically as Authorization: Bearer <secret>.
Polar webhook URL: https://feeauditor.com/api/webhooks/polar
Events to enable: order.paid, order.created, checkout.updated (handled in route)
For the best paid flow, set POLAR_ACCESS_TOKEN so the app creates a per-report checkout session with a success URL back to the exact report. Static checkout links remain as a fallback, but they cannot return users directly to a specific report.

SEO (built-in): after deploy verify `NEXT_PUBLIC_BASE_URL` matches production, then open `/sitemap.xml` and `/robots.txt`.
Refund policy URL for checkout/provider compliance: `https://feeauditor.com/refund`.

### Production domain & email (`feeauditor.com`)

1. **Vercel → Project → Settings → Environment Variables** (at least **Production**):  
   - `NEXT_PUBLIC_BASE_URL` = `https://feeauditor.com`  
   - `EMAIL_FROM` = `Fee Auditor <noreply@feeauditor.com>`  
   Redeploy after saving.

   **`www` → apex:** the repo includes a permanent redirect in `vercel.json` so `https://www.feeauditor.com/*` goes to `https://feeauditor.com/*`. Confirm in production after DNS points both hosts at Vercel.

2. **Resend**: add domain `feeauditor.com`, then in **Namecheap** create DNS records **exactly** as Resend shows (SPF / DKIM / Return-Path — copy host & value character-for-character).

3. **DMARC** (Namecheap, separate from Resend’s wizard):  
   - Type: **TXT** · Host: **`_dmarc`** · Value: **`v=DMARC1; p=none;`** · TTL: Automatic  

4. After **Verify domain** in Resend: run the paid report flow and confirm the message is from `Fee Auditor <noreply@feeauditor.com>`.

5. **Smoke URLs** (after deploy):  
   `https://feeauditor.com`, `/sitemap.xml`, `/robots.txt`, `/stripe-fee-calculator`, `/stripe-balance-csv`, `/why-stripe-fee-rate-higher-than-2-9`

6. **Google Search Console**: add property `feeauditor.com`, verify via **TXT** at Namecheap as GSC instructs, submit sitemap `https://feeauditor.com/sitemap.xml`.

---

What this is not

Not a reconciliation tool (doesn't compare with bank statements)
Not financial advice
Not guaranteed to be 100% accurate — results depend on what Stripe exports
Not a replacement for Stripe Dashboard — it's a layer on top for trend visibility
