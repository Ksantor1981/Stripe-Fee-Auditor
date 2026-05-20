# Fee Auditor — план роста (PMF + конверсия)

Основа: аналитический отчёт (май 2026). **Проблема сейчас — охват и трение CSV**, не отсутствие боли.

## Уже есть в продукте

- Блог + SEO, sitemap, pillar, `/stripe-fee-calculator` + mini-estimate
- Отчёт: benchmark, refund leakage, fee mix charts, geography, `SavingsOpportunities` (только multi-month)
- Beta: полный отчёт бесплатно; ops: `/api/health`, CI, structured `ops_event` logs
- Plausible goals + funnel (ручная настройка)

## Фазы

### Фаза 1 — «Отчёт = инструмент оптимизации» (1–2 недели, код)

| # | Задача | Статус |
|---|--------|--------|
| 1.1 | Savings / Opportunities на **всех** режимах отчёта | done |
| 1.2 | Карточки: проблема → потери → **action + ссылка Stripe Dashboard** | done |
| 1.3 | Лог `usd_only_rejected` + copy на `/analyze` (USD beta) | done |
| 1.4 | Лендинг: CTA «Quick estimate» → `/stripe-fee-calculator` | done |
| 1.5 | Таблица «Where fees leak» (fixed / intl / other из CSV) | planned |
| 1.6 | Savings в single-month + low-volume (beta `hasFullAccess`) | done |

### Фаза 2 — Снижение барьера CSV (2–4 недели)

| # | Задача | Зависимости |
|---|--------|-------------|
| 2.1 | GIF/видео на шаге Export (Stripe → Balance itemized) | ассет от владельца |
| 2.2 | Усилить FAQ: PII в CSV, что не сохраняем | copy |
| 2.3 | **Client-side parse** (опционально): парсинг в браузере, на сервер только агрегаты | архитектура |
| 2.4 | Social proof: 1 скрин/цитата без PII | контент от владельца |

### Фаза 3 — Удержание и дифференциация (4+ недели)

| # | Задача |
|---|--------|
| 3.1 | What-if симулятор (SEPA / ACH toggles → пересчёт ставки) |
| 3.2 | Email «загрузите CSV через месяц» / сравнение периодов |
| 3.3 | EUR/GBP single-currency (после сигнала в логах) |
| 3.4 | Партнёрства (бухгалтеры, IH/Reddit value-first) |

### Фаза 4 — Маркетинг (параллельно, владелец)

- SEO: 1 статья / 2 недели, перелинковка на `/analyze`
- Twitter: микро-инсайты из sample/leakage report
- Reddit/IH: ответы без спама, UTM
- Paid ads — **после** конверсия analyze → report > ~5%

## Метрики (еженедельно)

- Plausible: visits, bounce, funnel steps
- Neon: `weekly-metrics.sql`
- Vercel logs: `ops_event` + `usd_only_rejected`
- GSC: impressions/clicks

## Не делаем сейчас

- OAuth (конкурирует с privacy-USP)
- Полная мультивалюта mixed-CSV
- Sentry (по желанию позже)
