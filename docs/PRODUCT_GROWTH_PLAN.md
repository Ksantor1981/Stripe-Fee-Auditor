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
- **Report workspace** (Aug 12): Overview / Drivers / Trends / Transactions; safe blurred free preview; locked CSV + sample PDF; paywall без Chrome/Monitor; reconciliation compact; prod paywall gate (`4902819`)
- Beta flag: **не обходит paywall в production** (`lib/beta-access.ts`); ops: `/api/health`, CI, structured `ops_event` logs
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
| L.4 | **Side-by-side** «Stripe Dashboard vs Fee Auditor» (2 скрина + 3 строки) | P1 | backlog | **M.3** — generic Stripe Dashboard скрин (без PII); ~1h после ассета |
| L.5 | Trust line: descriptions stripped / financial rows only + link на data handling | P1 | **done** (Aug 8) | Hero → `/privacy#security`; §7 расширен |
| L.6 | **`/security`** или расширенный `privacy#security` для CFO (in-memory, no OAuth, retention, GitHub) | P1 | **partial** | **M.4** — §7 + anchor done; `/security` optional |
| L.7 | Stripe Billing % в статьях (Metronome 2026) — audit outdated Starter/Scale | P1 | backlog | **M.5** — content pass по blog/FAQ, не hero |
| L.8 | Scenario switcher для sample (3 демо) | P2 | **partial** | L.30 tabs v1; отдельные скрины → L.30b |
| L.9 | `/for-cfo` (multi-upload, white-label PDF) | P2 | skip | После PMF / agency спроса |

### Performance & a11y — Aug 2026 (PageSpeed / Lighthouse)

| # | Задача | Приоритет | Статус | Примечание |
|---|--------|-----------|--------|------------|
| L.10 | `llms.txt` markdown links + обновление positioning | P1 | **done** (Aug 8) | Agent browsing PSI 3/3 |
| L.11 | Footer / quotes contrast (`gray-400` → `gray-600` + underline) | P1 | **done** (Aug 8) | a11y 97 → ~100 |
| L.12 | Убрать unused preconnect `checkout.polar.sh` | P2 | **done** (Aug 8) | PSI «неиспользуемый preconnect» |
| L.13 | GA4 + Plausible → `next/script` `afterInteractive` | P2 | **done** (Aug 8) | ↓ TBT / render delay на mobile |
| L.14 | Убрать `fetchPriority="high"` у sample PNG (LCP = H1) | P2 | **done** (Aug 8) | — |
| L.15 | WebP/AVIF для `report-preview` + `sizes` + lazy | P2 | **done** (Aug 8) | 80→31 KB 1x, lazy below fold |
| L.16 | Перезапустить PSI desktop + mobile после деплоя | ops | **monitor** | Baseline Aug 8: mobile perf **87**, LCP **3.3s**, a11y **100**; desktop ~97→100 (lab). См. **M.1–M.2** |
| L.17 | Hero server CTAs (`FunnelAnchor` + delegate), dynamic Nav/FAQ | P1 | **done** (Aug 8) | perf 70→87, LCP 5.5→3.3s |
| L.18 | Nav at end of DOM; hero first; analytics lazyOnload | P2 | **superseded** | Заменено L.19: nav shell сверху + idle hydrate (desktop SI) |
| L.19 | Nav shell top + `LandingNavHydrate`; GA off `/`; `FunnelClickDelegate` idle; browserslist | P2 | **done** (Aug 9) | **M.7** после деплоя |
| L.20 | **Wave G** hero: softer H1, «Stripe gives rows / we tell you what they mean», outcome CTA | P1 | **done** (Aug 9) | Refine L.1 hook; не visual redesign |
| L.21 | Anti–CSV-summary + deterministic line («not an AI estimate») под hero CTA | P1 | **done** (Aug 9) | Зеркало pricing copy |
| L.22 | CFO block под sample: founders + fractional CFOs, Monitor/Pricing links | P1 | **done** (Aug 9) | Не отдельный `/for-cfo` (L.9) |
| L.23 | Sample: dollar payoff (~$270/qtr vs 2.9%), единый range 3.5–4.2% + edge-case disclaimer | P1 | **done** (Aug 9) | **M.6** — sync `llms.txt` |
| L.24 | Trust strip: OAuth / not stored / deterministic (3 пункта + data handling link) | P1 | **done** (Aug 9, refined Aug 11) | GitHub — в footer, не в strip |
| L.25 | Pricing line on hero: Free preview · $12 · $9/mo | P1 | **removed** (Aug 11 `fb9573a`) | Цена только на `/pricing`; laconic hero (L.29) |
| L.26 | Case study stats in sample (Typical SaaS tab, 4.02%) | P1 | **done** (Aug 9) | `LandingSampleTabs` |
| L.27 | Founder one-liner → `/about` | P1 | **removed** (Aug 11 laconic pass) | About — через footer/nav |
| L.28 | $1M × 0.5pp math + 4 MB limit (1 line hero) | P1 | **done** (Aug 9) | — |
| L.29 | Laconic pass: убрать дубли CTA/links под hero и footer | P1 | **done** (Aug 9) | Footer = 1 CTA |
| L.30 | Interactive sample tabs (3 scenarios, shared screenshot) | P1 | **done** (Aug 9) | Per-scenario PNG → backlog **L.30b** |

### Report UX — Aug 12 2026 (paywall + workspace)

Источник: user testing free preview + Codex pass. **Не возвращать** pricing/Chrome/Monitor на paywall; **не** раздувать hero мелким шрифтом.

| # | Задача | Статус | Коммит / примечание |
|---|--------|--------|---------------------|
| R.1 | Report workspace: 4 вкладки, одна навигация | **done** | `24858ab`, `87f8fc0` |
| R.2 | Free preview: находка + агрегаты + **безопасный** blur (placeholder, не real rows) | **done** | `LockedReportPreview`, `lib/report-preview.ts` |
| R.3 | Export CSV/PDF видимы; free → unlock modal; **sample → PDF открыт** | **done** | `LockedExportButtons`, print gate для `demo-sample` |
| R.4 | Убрать Chrome + Monitor из paywall; review только после full report | **done** | `87f8fc0`, `feaf9f3` |
| R.5 | Reconciliation compact в Overview | **done** | `87f8fc0` |
| R.6 | Report footer: legal links only (без SEO blog strip) | **done** | `87f8fc0` |
| R.7 | Prod: `FULL_REPORTS_FREE_DURING_BETA` не обходит gate | **done** | `4902819` + test |
| R.8 | i18n: fee grade, feeLabels, RU report UI, 6 locales | **done** | `d4ad18a` |
| R.9 | Merge duplicate workspace panels (low/single volume) | **done** | follow-up Aug 12 |
| R.10 | SEO `messages/pages/*` (~1248 EN strings) | backlog | **не** bulk autotranslate |

**Следующий приоритет (не landing-decor):** post-beta smoke (#9), validation sprint (10–15 audits), M.1 PSI после деплоя.

### Периодический мониторинг — не срочно, но обязательно

**Не блокируют релиз**, но без них легко пропустить регресс после «массовых» правок (лендинг, layout, analytics, nav, скрины, perf).

**Полный чек запускать когда:**

- деплой затронул `app/page.tsx`, `app/layout.tsx`, `components/LandingNav*`, analytics, скрины лендинга; **или**
- серия **≥3 коммитов** UI/perf подряд; **или**
- раз в **месяц** spot-check, если правок не было.

| # | Что | Периодичность | Порог / действие |
|---|-----|---------------|------------------|
| **M.1** | [PSI mobile](https://pagespeed.web.dev/analysis?url=https://feeauditor.com&form_factor=mobile) + [desktop](https://pagespeed.web.dev/analysis?url=https://feeauditor.com&form_factor=desktop) | после mass deploy + **1×/мес** | Mobile: perf **≥85**, LCP **≤3.5s**, a11y **100**. Desktop: perf **≥95** (цель 100). Ниже порога → новый perf pass, не hero-контент |
| **M.2** | Зафиксировать score в таблице **L.16** (дата + 4 цифры) | каждый прогон M.1 | Aug 8 mobile: 87 / 3.3s / a11y 100. Aug 9: пауза после L.19 — перепроверить **после деплоя** |
| **M.3** | **L.4** side-by-side Stripe Dashboard vs Fee Auditor | content sprint / **1×/кв** | Backlog до generic Stripe Dashboard скрина (без PII) |
| **M.4** | **L.6** `/security` vs `privacy#security` | **1×/кв** или запрос CFO/partner | Partial OK; отдельный URL — по спросу, не блокер |
| **M.5** | **L.7** audit Stripe Billing % в blog/FAQ | **1×/кв** или новости Stripe pricing | Content pass; не трогать hero |
| **M.6** | `public/llms.txt` + positioning vs hero/H1 | после смены первого экрана / **1×/кв** | Agent browsing PSI 3/3; дата в файле актуальна |
| **M.7** | Prod vs local: L.19 (nav hydrate, GA off `/`) | **сразу после деплоя** L.19 | View-source `/`: nav shell в начале `<main>`; на `/` нет `googletagmanager.com` в Network до навигации |

**Статус на 2026-08-12:** Report workspace + paywall pass (**R.1–R.9**) в prod. Landing laconic (**L.29**, pricing off hero). **Следующий P1:** post-beta smoke, validation sprint, L.4 side-by-side. **Ops:** M.1–M.2, M.6–M.7 после деплоя.

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
- **PSI / Lighthouse (M.1–M.2):** не каждую неделю — **1×/мес** или после mass deploy лендинга/perf (см. таблицу выше)

**Критерий «трафик ок, пора усложнять продукт»:** стабильный organic на Stripe tools **или** предсказуемый analyze → unlock — иначе не открывать новые вертикали.

## Не делаем сейчас

- OAuth (конкурирует с privacy-USP)
- **Landing re-expansion:** pricing line на hero, testimonial strip, FAQ default-open — откат L.29
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
