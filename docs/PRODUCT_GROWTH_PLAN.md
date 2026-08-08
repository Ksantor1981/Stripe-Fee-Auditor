# Fee Auditor — план роста (PMF + конверсия)

Основа: аналитический отчёт (май 2026) + GSC/PH сигнал (Jul 2026). **Проблема — охват и трение CSV**, не отсутствие боли. SEO avg position ~26 = канал ещё не «созрел» для оценки; не плодить статьи.

## Позиционирование (Jul 2026)

| Было | Стало |
|------|--------|
| «Audit your Stripe fees» | **Find why your Stripe effective rate / payout is higher than expected** |
| Абстрактный audit | Конкретные проблемы: **international cards**, **refund fees not returned**, **monthly anomaly / rate drift** |
| Monitor = «ещё один отчёт/мес» | **Catch rate drift, refund leakage, and one-off anomalies before they become normal** |

Честная privacy (PH/IH/site): *No OAuth. Raw CSV is not stored; we keep only redacted calculated results.*  
Шаблон: `docs/DISTRIBUTION_COPY.md`. **Запрещено:** «data never leaves your browser».

## Уже есть в продукте

- Блог + SEO, sitemap, pillar, `/stripe-fee-calculator` + mini-estimate
- SEO long-tails (Jul 2026): calculator, what-percent, pillar effective rate, intl/refund/reconciliation harvest
- Отчёт: benchmark, refund leakage, fee mix, geography, savings; **Normal vs outlier-adjusted rate** блок + mark one-offs
- Conversion sprint (sample CTA, money-first paywall, email skip)
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
| 1.7 | **Expected outliers** — пометка one-off charges, пересчёт rate (PH: Oktay) | done |
| 1.8 | Conversion sprint: sample CTA, money-first paywall, email skip, SEO → /analyze | done |
| 1.9 | **P1:** UI *Normal rate vs outlier-adjusted* всегда в отчёте + pain-led landing/Monitor + honest privacy copy | done (Jul 19) |

### Landing UX — Aug 2026 (hero / sample / trust)

Источник: LLM-аудит первого экрана + user testing mobile. **P0 = сразу в прод**, **P1 = следующий спринт**, **P2 = после сигнала трафика**.

| # | Задача | Приоритет | Статус | Блокер / когда делать |
|---|--------|-----------|--------|------------------------|
| L.1 | Hero **Variant A** (3.5–4.2%, «Find out where your money goes») | P0 | **done** (2058e06) | — |
| L.2 | Sample disclaimer: heavy intl mix, типичный range ~3.8–5.2% | P0 | **done** (2058e06) | — |
| L.3 | Hero link «No CSV yet? Export in 2 clicks» → `/stripe-balance-csv` | P0 | **done** (2058e06) | — |
| L.4 | **Side-by-side** «Stripe Dashboard vs Fee Auditor» (2 скрина + 3 строки) | P1 | backlog | Нужен **generic** скрин Stripe Dashboard (без PII); ~1h после ассета |
| L.5 | Trust line: descriptions stripped / financial rows only + link на data handling | P1 | **done** (Aug 8) | Hero → `/privacy#security`; §7 расширен |
| L.6 | **`/security`** или расширенный `privacy#security` для CFO (in-memory, no OAuth, retention, GitHub) | P1 | **partial** | §7 + anchor done; отдельный `/security` — optional для CFO URL |
| L.7 | Stripe Billing % в статьях (Metronome 2026) — audit outdated Starter/Scale | P1 | backlog | Content pass по blog/FAQ, не hero |
| L.8 | Scenario switcher для sample (3 демо) | P2 | skip | Дорого; текст-дисклеймер (L.2) достаточно |
| L.9 | `/for-cfo` (multi-upload, white-label PDF) | P2 | skip | После PMF / agency спроса |

### Performance & a11y — Aug 2026 (PageSpeed / Lighthouse)

| # | Задача | Приоритет | Статус | Примечание |
|---|--------|-----------|--------|------------|
| L.10 | `llms.txt` markdown links + обновление positioning | P1 | **done** (Aug 8) | Agent browsing PSI 3/3 |
| L.11 | Footer / quotes contrast (`gray-400` → `gray-600` + underline) | P1 | **done** (Aug 8) | a11y 97 → ~100 |
| L.12 | Убрать unused preconnect `checkout.polar.sh` | P2 | **done** (Aug 8) | PSI «неиспользуемый preconnect» |
| L.13 | GA4 + Plausible → `next/script` `afterInteractive` | P2 | **done** (Aug 8) | ↓ TBT / render delay на mobile |
| L.14 | Убрать `fetchPriority="high"` у sample PNG (LCP = H1) | P2 | **done** (Aug 8) | — |
| L.15 | WebP/AVIF для `report-preview` + `sizes` | P2 | backlog | ~160 KiB на mobile |
| L.16 | Перезапустить PSI desktop + mobile после деплоя | ops | pending | Baseline Aug 6 устарел |

**Мониторинг (2026-08-08):** P0 и L.5 закрыты. L.6 частично (anchor + bullets). L.10–L.14 закрыты одним pass. **Следующий P1 по ROI:** L.4 после generic Stripe Dashboard скрина. L.7 — content pass. L.15 — если mobile perf &lt; 85 после L.13.

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
| 4.1 | **GSC harvest / CTR** | **Не писать новые статьи.** Правка title/H1/meta на URL с impressions. **Pass Jul 19 evening:** balance-csv, how-to-export, intl fees, OAuth privacy (+ sync title↔H1 на privacy cluster, small-tx, blended, leakage, case study, cross-border) | P0 |
| 4.2 | **Дистрибуция** | PH/IH/X: pain-led скрин (intl / refund / anomaly) + честная privacy-строка из `DISTRIBUTION_COPY.md`. UTM на канал | P0 |
| 4.3 | **Перелинковка** | Blog ↔ calculator ↔ why-higher ↔ `/analyze` — уже есть; усиливать вокруг pain URLs | P1 |
| 4.4 | **1 comparison только по спросу** | Новая `/stripe-vs-*` **только** если GSC показывает query; иначе — нет | P1 |
| 4.5 | **Editorial** | Пауза thin listicles пока avg position не улучшится; только точечный harvest существующих URL | P1 |
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
- **Chrome Extension: CSV upload / free diagnosis внутри popup** — отложено до оценки upload-теста (~2026-08-12). После теста: сначала free-first copy (popup + Store); drop→`/analyze` только при спросе. См. `chrome-extension/README.md` → Post-test backlog и `docs/ops/WEDNESDAY_MANUAL_STEPS.md` §6.

### Когда пересмотреть AI wedge

Любое из:

1. Stripe organic (tools + blog) ≳ **500 sessions/мес** и воронка analyze→preview живая, **или**
2. GSC: потолок по текущим Stripe queries при CTR уже нормальном, **или**
3. Осознанный pivot / waitlist-эксперимент с бюджетом внимания 1–2 вечера/мес на `pricing.json`

Минимум при входе: `/ai` hub + llm-pricing + token calculator + 1 blog funnel — **не** полный Advisor/SDK. `/tools` — только при 5+ инструментах. Отдельный бренд Advisor — не на feeauditor.com hero.
