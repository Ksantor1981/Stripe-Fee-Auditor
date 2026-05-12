# TECH_SPEC: Stripe Fee Auditor MVP v1.3

## 1. Цель

MVP принимает Stripe Balance CSV, считает реальную эффективную ставку комиссий и показывает, какие транзакции и паттерны поднимают стоимость обработки платежей. Модель монетизации: бесплатное превью + одноразовая разблокировка полного отчета через Polar.

## 2. Стек и окружение

- Frontend/Backend: Next.js App Router, TypeScript
- UI: Tailwind, shadcn/ui, Recharts
- CSV: Papa Parse
- База данных: Neon PostgreSQL
- Оплата: Polar checkout + signed webhooks
- Email: Resend
- Деплой: Vercel

Raw CSV не пишется в Blob/bucket и не сохраняется как файл. На сервер отправляется CSV-текст, он парсится в памяти, а в Neon сохраняется только результат анализа.

## 3. Основные user flows

1. Пользователь открывает `/`.
2. Переходит на `/analyze`, видит инструкции экспорта Balance CSV.
3. Загружает CSV или открывает demo flow `/analyze?sample=1`.
4. Получает отчет `/report/[id]?token=...` в одном из 3 режимов:
   - `multi-month`
   - `single-month`
   - `low-volume` (<50 charge-транзакций)
5. Free preview показывает summary + top 3 fee drivers.
6. Full Report через Polar разблокирует anomalies, savings opportunities, monthly detail, CSV export и print-ready report.
7. После оплаты Polar webhook помечает отчет как paid, продлевает TTL до 30 дней и отправляет email-ссылку при наличии Resend.

## 4. Функциональные требования

### 4.1 Upload & Parse

- Поддержка Stripe Balance Transactions CSV
- Автодетект обязательных колонок: `id`, `type`, `amount`, `fee`, `net`, `currency`, `created`
- Ручной column mapping как fallback
- Preview первых строк перед анализом
- Максимальный CSV: 4 MB

### 4.2 Аналитика

- Расчет `chargeVolume`, `chargeFees`, `chargeRate`, `otherFees`
- Monthly breakdown по `YYYY-MM`
- Period comparison при 2+ месяцах
- Adaptive strategy:
  - `<50` charge-транзакций: top 5 highest fee-rate transactions, без статистической anomaly-модели
  - `>=50`: anomaly threshold = blended charge rate + `2.5 * stdDev(monthly rates)`
- Savings opportunities считаются в major currency units после нормализации CSV (`1000` cents -> `$10.00`)

### 4.3 Freemium / Paid

- Free: summary + top 3 fee drivers + paywall
- Paid Full Report: full anomaly list, explanations, savings opportunities, monthly detail, CSV export, print-ready report
- Public paid UI currently exposes one product: `pro` / Full Report ($12)
- Basic/Team tiers should not be shown until the backend stores plan-level entitlements

### 4.4 Retention & Privacy

- Public pages load **Plausible Analytics** (aggregate traffic; see Privacy Policy / CSP `plausible.io`)
- Raw CSV is processed in memory only
- Free previews expire after about 1 hour
- Checkout extends free report TTL to reduce payment/webhook race risk
- Paid report access expires after about 30 days
- Report access requires `reportId + accessToken`; token is hashed in DB
- `?token=` bearer links are convenient but remain a known hardening target for a future httpOnly-cookie exchange

## 5. API contracts

- `POST /api/analyze` -> `{ reportId, accessToken, mode, isDemo, summary }`
- `GET /api/checkout?plan=pro&reportId=...&token=...` -> Polar redirect
- `POST /api/webhooks/polar` -> verifies signature, product id, metadata and idempotency; marks report paid
- `POST /api/reports/[id]/email` -> stores email and sends report link when Resend is configured
- `GET /api/export/csv?reportId=...&token=...` -> paid CSV export
- `/report/[id]/print?token=...` -> paid print-ready report page
- `GET /api/cron/cleanup` -> deletes expired reports/rate-limit rows; requires `CRON_SECRET` bearer auth

## 6. Structure

```text
/app
  /page.tsx
  /analyze/page.tsx
  /report/[id]/page.tsx
  /report/[id]/print/page.tsx
  /api/analyze/route.ts
  /api/checkout/route.ts
  /api/export/csv/route.ts
  /api/reports/[id]/email/route.ts
  /api/webhooks/polar/route.ts
  /api/cron/cleanup/route.ts
/lib
  /csv-parser.ts
  /fee-analyzer.ts
  /db.ts
  /polar.ts
  /email.ts
```

## 7. Rate Limits

- Real CSV analysis: 10/day/IP (launch default; adjust in `app/api/analyze/route.ts` if needed)
- Demo sample analysis: 20/day/IP
- Email gate sends: 10/day/IP
- Checkout redirects: 30/day/IP after report token validation

## 8. Definition of Done

- Все 3 режима отчета работают на sample и реальных Stripe CSV
- Free preview не отправляет full paid result в client payload
- Polar paid flow разблокирует отчет даже если redirect пришел раньше webhook
- Webhook идемпотентен и возвращает 500 на retryable DB/report failures
- Sitemap/robots/canonical используют `https://feeauditor.com`
- Privacy/Terms/Refund актуальны для Polar + Resend + Neon
