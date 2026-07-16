# Fee Auditor — план роста (PMF + конверсия)

Основа: аналитический отчёт (май 2026). **Проблема сейчас — охват и трение CSV**, не отсутствие боли.

## Уже есть в продукте

- Блог + SEO, sitemap, pillar, `/stripe-fee-calculator` + mini-estimate
- SEO long-tails (Jul 2026): calculator + `/what-percent-does-stripe-take` под Trends-запросы
- Отчёт: benchmark, refund leakage, fee mix charts, fee leak breakdown, geography, `SavingsOpportunities` во всех режимах
- Expected outliers; conversion sprint (sample CTA, money-first paywall, email skip)
- Beta flag: на проде обычно paid; ops: `/api/health`, CI, structured `ops_event` logs
- Plausible goals + funnel (ручная настройка)

## Фазы

### Фаза 1 — «Отчёт = инструмент оптимизации» (1–2 недели, код)

| # | Задача | Статус |
|---|--------|--------|
| 1.1 | Savings / Opportunities на **всех** режимах отчёта | done |
| 1.2 | Карточки: проблема → потери → **action + ссылка Stripe Dashboard** | done |
| 1.3 | Лог `usd_only_rejected` + copy на `/analyze` (USD beta) | done |
| 1.4 | Лендинг: CTA «Quick estimate» → `/stripe-fee-calculator` | done |
| 1.5 | Таблица «Where fees leak» (fixed / intl / refund / other из CSV) | ready |
| 1.6 | Savings в single-month + low-volume (beta `hasFullAccess`) | done |
| 1.7 | **Expected outliers** — пометка one-off charges, пересчёт rate без искажения monthly avg (PH: Oktay, Jul 2026) | done |
| 1.8 | Conversion sprint: sample CTA, money-first paywall, email skip, SEO → /analyze | done |

### Фаза 2 — Снижение барьера CSV (2–4 недели)

| # | Задача | Зависимости |
|---|--------|-------------|
| 2.1 | GIF/видео на шаге Export (Stripe → Balance itemized) | ассет от владельца — UI готов без видео |
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

### Фаза 4 — Трафик и дистрибуция (параллельно, фокус Stripe)

**Принцип:** сначала **снять урожай** с уже живых SEO-страниц и sample CTA, не плодить второй продукт/кластер.

| # | Рычаг | Как | Приоритет |
|---|--------|-----|-----------|
| 4.1 | **GSC harvest** | Раз в неделю: pages с impressions и CTR &lt; среднего → правка title/H1/meta (как Jul 2026: calculator + what-percent). Не писать новые страницы, пока топ-10 существующих недожаты. **Pass Jul 16:** без live GSC export — proxy по priority + Trends: pillar why-high, balance-csv, square vs stripe, processing-fees blog | P0 |
| 4.2 | **Дистрибуция калькулятора / sample** | 2–3 value-first поста/нед (X, Reddit r/SaaS / r/stripe, IH): скрин «effective rate vs 2.9%» + ссылка на `/stripe-fee-calculator` или Try sample → `/analyze`. UTM на каждый канал | P0 |
| 4.3 | **Перелинковка** | Каждая Stripe SEO/blog → primary CTA `/analyze` + secondary calculator; pillar ↔ comparison ↔ why-higher. *Не «сломанная» — уже есть CTA; цель — плотнее кластер tools↔guides* | P1 |
| 4.4 | **1 comparison только по спросу** | Новая `/stripe-vs-*` **только** если в GSC есть query с impressions; иначе — нет. *Сейчас comparisons уже есть; не плодить новые без данных* | P1 |
| 4.5 | **Editorial funnel** | 1 гайд / 2 недели под long-tail (*how much does Stripe charge*, *reduce Stripe fees*) → CTA tools, не thin listicles. *Ритм контента, не срочный фикс* | P1 |
| 4.6 | **Shareable sample insight** | Один публичный «анонимный» leakage-сниппет (цифры без PII) для соцсетей / PH follow-up | P2 |
| 4.7 | **Партнёрства / списки** | Бухгалтеры, «tools for indie founders», newsletter swaps — value-first, не spam directories | P2 |
| 4.8 | Paid ads | Только после analyze → report ≳ 5% | later |

Не размывать: **не** 50 comparison-страниц; **не** AI SEO wedge (см. ниже).

## Метрики (еженедельно)

- Plausible: visits, bounce, funnel steps
- Neon: `weekly-metrics.sql`
- Vercel logs: `ops_event` + `usd_only_rejected`
- GSC: impressions/clicks **по URL** (calculator, what-percent, analyze, blog tops)

**Критерий «трафик ок, пора усложнять продукт»:** стабильный organic на Stripe tools **или** предсказуемый analyze → unlock — иначе не открывать новые вертикали.

## Не делаем сейчас

- OAuth (конкурирует с privacy-USP)
- Полная мультивалюта mixed-CSV
- Sentry (по желанию позже)
- **AI-кластер `/ai/*`, `/tools` hub, AI Spend Advisor** — отложено (решение Jul 2026). IA «tools не в `/blog`» верна **на потом**; сейчас opportunity cost &gt; SEO-опцион. Устаревшие LLM-цены хуже отсутствия страниц.

### Когда пересмотреть AI wedge

Любое из:

1. Stripe organic (tools + blog) ≳ **500 sessions/мес** и воронка analyze→preview живая, **или**
2. GSC: потолок по текущим Stripe queries при CTR уже нормальном, **или**
3. Осознанный pivot / waitlist-эксперимент с бюджетом внимания 1–2 вечера/мес на `pricing.json`

Минимум при входе: `/ai` hub + llm-pricing + token calculator + 1 blog funnel — **не** полный Advisor/SDK. `/tools` — только при 5+ инструментах. Отдельный бренд Advisor — не на feeauditor.com hero.
