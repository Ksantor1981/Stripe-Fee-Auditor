# TECH_SPEC: Stripe Fee Auditor MVP v1.2

## 1. Цель

Запустить MVP за 5 дней (27 часов), который принимает Stripe Balance CSV и возвращает отчет по комиссиям с freemium-моделью и платной разблокировкой полного анализа.

## 2. Стек и окружение

- Frontend/Backend: Next.js 14 (App Router), TypeScript
- UI: Tailwind, shadcn/ui, Recharts
- CSV: PapaParse
- База данных: Neon PostgreSQL
- Файлы: Vercel Blob
- Деплой: Vercel (auto-deploy from `main`)
- Оплата: LemonSqueezy

## 3. Основные user flows

1. Пользователь открывает лендинг `/`.
2. Переходит на `/analyze`, видит инструкции экспорта.
3. Загружает CSV, получает preview и запускает анализ.
4. Видит результат в одном из 3 режимов:
   - multi-month
   - single-month
   - low-volume (<50 transactions)
5. Для полного отчета выполняет оплату.

## 4. Функциональные требования

### 4.1 Upload & Parse

- Поддержка Balance CSV от Stripe
- Автодетект обязательных колонок: `id`, `type`, `amount`, `fee`, `net`, `currency`, `created`
- Ручной column mapping как fallback
- Preview первых 5 строк

### 4.2 Аналитика

- Расчет:
  - `chargeVolume`
  - `chargeFees`
  - `chargeRate`
  - `otherFees`
- Monthly breakdown по `YYYY-MM`
- Adaptive anomaly strategy:
  - `<50` charge-транзакций: top 5 highest-fee transactions
  - `>=50`: статистическое выделение аномалий по порогу `avg + 2*std`
- Period comparison при `>=2` месяцев, иначе fallback single-period

### 4.3 Freemium / Paid

- Free: summary + top 3 drivers
- Paid: полный список аномалий, monthly detail, PDF/CSV export
- Email gate перед показом free preview

### 4.4 Retention & Privacy

- Удаление загруженных CSV через 1 час
- Rate limiting: 3 free reports / IP / day
- Email verification в free tier

## 5. API контракты (MVP)

- `POST /api/upload` -> `{ sessionId, blobUrl }`
- `POST /api/analyze` -> `{ reportId, summary, mode }`
- `GET /api/export/pdf?reportId=...` -> `application/pdf`
- `GET /api/export/csv?reportId=...` -> `text/csv`
- `POST /api/webhooks/lemonsqueezy` -> `200 OK` + update `isPaid`

## 6. Структура приложения

```text
/app
  /page.tsx
  /analyze/page.tsx
  /report/[id]/page.tsx
  /report/[id]/print/page.tsx
/api
  /upload/route.ts
  /analyze/route.ts
  /export/pdf/route.ts
  /export/csv/route.ts
  /webhooks/lemonsqueezy/route.ts
/lib
  /csv-parser.ts
  /fee-analyzer.ts
  /db.ts
```

## 7. Нефункциональные требования

- Время анализа типового CSV: до 3 секунд
- Надежная обработка пустых/поврежденных строк
- Отсутствие хранения raw CSV дольше TTL
- HSTS и TLS в production

## 8. Риски и mitigation

- Нестабильный формат CSV -> robust mapping + информативные ошибки
- Малый объем данных -> отдельный low-volume режим
- Платежные edge-cases -> идемпотентный webhook handler

## 9. Definition of Done (MVP)

- Все 3 режима отчета работают на реальных данных
- Оплата успешно разблокирует full report
- PDF/CSV export отдают корректные файлы
- Деплой на Vercel с настроенными env vars
- Есть страницы Privacy Policy и Terms of Service
