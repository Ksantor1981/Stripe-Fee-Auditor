# Среда 29.07 — ручные шаги (после деплоя 217286a)

## 1) Vercel Firewall (2 мин)

**Статус 01.08.2026:** правило опубликовано в production:
`POST /api/analyze` → 5 запросов/мин/IP. Проверка:

```bash
npx vercel firewall rules ls
```

Команда создания ниже оставлена для восстановления правила, если его удалят:

```bash
npx vercel firewall rules add "Rate limit analyze POST" ^
  --condition "{\"type\":\"path\",\"op\":\"eq\",\"value\":\"/api/analyze\"}" ^
  --condition "{\"type\":\"method\",\"op\":\"eq\",\"value\":\"POST\"}" ^
  --action rate_limit ^
  --rate-limit-algo fixed_window ^
  --rate-limit-window 60 ^
  --rate-limit-requests 5 ^
  --rate-limit-keys ip ^
  --rate-limit-action rate_limit ^
  --description "Protect CSV analyze before serverless body parse" ^
  --yes

npx vercel firewall publish --yes
```

Либо UI: Project → Firewall → Configure → New Rule → path `/api/analyze` + POST → Rate Limit 5/min/IP → Publish.

## 2) Spend Management (если Pro)

Team Settings → Billing → Spend Management → $25–50 → email alerts → pause at limit.

На текущем Hobby-плане Spend Management недоступен; Vercel автоматически
приостанавливает Hobby-проект при исчерпании включённых лимитов. При переходе
на Pro сразу включить порог и `Pause all production deployments`.

## 3) Google Ads Search ($7/day, cap $100)

- Goal: Website traffic → Search
- Locations: United States, United Kingdom
- Networks: **off** Search Partners, **off** Display
- Budget: $7/day
- Bidding: Maximize clicks
- Final URL:  
  `https://feeauditor.com/why-stripe-fee-rate-higher-than-2-9?utm_source=google&utm_medium=cpc&utm_campaign=fee_diagnosis_exact`

### Keywords (exact + phrase)

```
[why are stripe fees so high]
"why are stripe fees so high"
[why did my stripe fees increase]
"why did my stripe fees increase"
[stripe effective rate]
"stripe effective rate"
[stripe payout lower than expected]
[stripe refund fees not returned]
[stripe international card fees]
[stripe fee reconciliation]
```

### Negatives (campaign)

```
export
tableau
postgres
json
qlik
api
developer
integration
merchant of record
paddle
paypal
jobs
support phone
```

### Ad copy

```
H1: Why Is Your Stripe Rate Higher?
H2: Find the Fee Driver in Your CSV
H3: No OAuth. Free Diagnosis First

D1: Upload a Stripe Balance CSV and see your real rate plus one concrete fee driver.
D2: Find international-card, refund, and small-ticket fee impact. Raw CSV is not stored.
```

Daily: Search terms → add junk as negatives. Do not expand keywords for 7 days.

## 4) Partner email template

Subject: `A client-facing Stripe fee reconciliation check`

```
Hi [Name],

I built a small CSV-based check for a question Stripe clients often bring to finance teams:
“Why is my payout / effective rate higher than expected?”

It uses the itemized Stripe Balance export to separate international-card uplift,
refund-fee retention, small-ticket drag, and other fee lines.

I can run the first client’s CSV free and return a client-facing report.
No OAuth; the raw CSV is not stored.

If one client currently has a payout or fee discrepancy, they can start here:
https://feeauditor.com/analyze?utm_source=partner&utm_medium=outreach&utm_campaign=[partner-slug]

Best,
Ksantor
support@feeauditor.com
```

## 5) Оценка upload-теста (~2026-08-12)

Метрика решения: **≥5 реальных CSV uploads**, не impressions.

SQL: `scripts/funnel-segmentation.sql` (окно ~2026-07-29 → 2026-08-12).

## 6) После теста — backlog (не делать во время окна)

### Chrome Extension → free-first (решение 2026-08-02)

Сейчас extension = launcher + monthly reminder (CSV **не** парсится).

1. **Сначала (дешёво):** ✅ popup + Store copy free-first (2026-08-04, extension `0.1.1`)  
   - Step 2 = Free diagnosis → `/analyze?utm_…popup_free_diagnosis`  
   - Fee Monitor $9 — secondary  
   - Store listing: helper + free preview на сайте
2. **Только если** есть заметные установки / запрос пользователей: drop CSV → открыть `/analyze`
3. **Не делать** полный analyze внутри popup, пока нет сигнала по п.2

Детали: `chrome-extension/README.md` → «Post-test backlog».

### Cheap site pass (2026-08-04)

- GSC harvest: title/meta на why-fees-increase, balance-csv, how-to-export, data-export, OAuth privacy posts
- `/analyze`: блок «какой CSV / ~60 sec» + trust
- Chrome extension free-first copy (см. выше)

## 7) Sample-first acquisition (с 2026-08-05)

**Не строить** новый большой hero-калькулятор. Ads **не включать**, пока Limited serving + нет ~20–30 sample/analyze визитов из LI/partners.

### Внешние ссылки (LI / DM / posts)

Всегда sample-flow, не голая главная:

```text
https://feeauditor.com/analyze?sample=1&utm_source=linkedin&utm_medium=dm&utm_campaign=[slug]
```

### KPI ближайшие 7 дней

Не клики/показы. Считать:

1. Открытия sample / `funnel_analyze_page_view` с `sample_query` / демо-отчёты  
2. `funnel_csv_loaded` (real)  
3. Реальные uploads (Neon / `funnel-segmentation.sql`)

Решение по продукту — только если sample не цепляет при нормальном числе визитов на `/analyze?sample=1`.

### CFO DM (короткий оффер)

```text
I’m testing a CSV-based Stripe fee audit report. No OAuth, raw CSV not stored.
It gives a client-ready breakdown of effective rate, refund leakage, international-card drag, and monthly drift.
Happy to run one sample/client CSV free if useful:
https://feeauditor.com/analyze?sample=1&utm_source=linkedin&utm_medium=dm&utm_campaign=[slug]
```

### SEO фокус (не плодить статьи)

Pain only: why fees so high · refund fees not returned · international card fees · effective rate · payout lower than expected.  
Не гнаться за export→Tableau/JSON/Postgres.
