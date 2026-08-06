# Homepage UX brief — пересборка `/` (Curiosity → Proof → Interaction → Result)

Статус: **контракт на реализацию**. Составлен до кода. Исполнитель — Composer 2.5.
Источники: пул задач P0/P1 (дизайнерский прогон), эссе о product-first лендинге, `docs/PRODUCT_GROWTH_PLAN.md`, `docs/ops/WEDNESDAY_MANUAL_STEPS.md`.

---

## 1. Контракт (не нарушать)

> Главная — **первый экран приложения**, а не маркетинговый сайт.
> Оптимизируем **Time to Demo** и **Time to Upload**, не Time on Page.
> Любой элемент, который не (а) повышает доверие одной строкой или (б) двигает к demo/upload — убирается с `/`.

Философия ссылок: Linear / Mercury / Stripe — минимум копирайта, product-first, interaction-first, mobile-first.

**Целевые числа:** первый CTA виден без скролла на 390px; Time to Demo &lt; 10 c; на `/` не более **6 секций** до футера.

**Развилки решены владельцем (не переоткрывать):**

1. H1 — контраст «dashboard says 2.9% / effective rate often isn't», не вопросительный вариант из эссе.
2. Uploader в hero главной — **не сейчас**, сначала замер Time to Upload на паре CTA.
3. `StripeFeeMiniEstimate` — убрать с `/`, оставить ссылкой на `/stripe-fee-calculator`.

---

## 2. Что НЕ делаем (границы)

| Не делать | Почему |
|---|---|
| Одноэкранный uploader без trust (iLovePDF) | Финансовый CSV ≠ конвертация PDF; холодному трафику нужна одна строка доверия |
| Удалять URL (`/blog/*`, `/stripe-fee-calculator`, `/how-it-works`, comparison-страницы) | Живой SEO-урожай; убираем только из **навигации главной**, страницы остаются и остаются в sitemap |
| Секции Product / Features / Resources / API / Enterprise (Relume) | Антипаттерн, продукта такого нет |
| Аккаунт как финал воронки | У нас no-signup до preview; климакс = **результат** (rate + driver) |
| Трогать `app/report/**`, `lib/fee-analyzer.ts` и прочий грязный working tree | Отдельные незакоммиченные правки, не мешать со скоупом лендинга |
| Менять pricing model ($12 / $9) | Только ясность формулировки, не цифры |
| Выдумывать отзывы и метрики («most users pay 3.8–4.2%») | Только реальные цитаты и числа из sample-отчёта |
| Новый visual language / дизайн-система | Пересборка композиции на текущем Tailwind-стиле |

---

## 3. Целевая архитектура `/`

```
0. Bar        одна строка: free diagnosis · no signup      → ссылка See sample report
1. Nav        Fee Auditor · Pricing · About · [Analyze my CSV]
2. CURIOSITY  H1-контраст + 1 строка подзаголовка
              [Analyze my CSV] (primary) · [See sample report] (secondary)
              trust-строка: No OAuth · raw CSV not stored · independent
3. PROOF      реальные числа из sample + скрин отчёта + 1 цитата
4. INTERACTION  «How we found them» — 3 карточки (export → analyze → drivers)
                + secondary CTA на sample
5. RESULT     $12 once / $9 per month — короткий блок ясности + финальный CTA upload
6. TRUST/FAQ  свёрнутый FAQ + ссылки how-it-works / privacy
   Footer     legal + SEO-перелинковка (как сейчас) + Blog / Chrome helper / calculator
```

Сейчас на `/` **11** секций. Целевое — **6**.

---

## 4. Задачи (для Composer)

Файлы скоупа: `app/page.tsx`, `components/LandingNav.tsx`, `app/analyze/page.tsx`, при необходимости новые компоненты в `components/`.

### R1 — Nav: убрать шум (`components/LandingNav.tsx`)

- `NAV_LINKS`: оставить **Pricing** (якорь `#pricing`) и **About**. Убрать `How it works` и `Blog` из хедера.
- Правый CTA: текст `Analyze my CSV` (сейчас `Analyze My Fees`), стиль — primary (заполненная кнопка), не бордер.
- Мобильное меню — те же пункты.
- `How it works` и `Blog` **остаются** в футере `app/page.tsx` (уже есть).
- Событий не менять: `funnel_nav_about`, `funnel_landing_cta` сохранить.

### R2 — Top bar и переименование demo-CTA

- В обеих ветках баннера (`FULL_REPORTS_FREE_DURING_BETA` и else) текст ссылки → **`See sample report →`**. Строка «Try sample in 10s» удаляется по всему репозиторию.
- Проверить остальные вхождения: `rg "sample in 10s"` — заменить везде (`/analyze`, баннеры, extension-копия, если есть).
- Кампании UTM не менять (`launch_banner_sample` и т.д.).

### R3 — Hero = Curiosity (одно решение)

Порядок внутри секции строго:

1. Eyebrow — оставить, 12px.
2. H1 — оставить смысл контраста: «Your Stripe dashboard says 2.9%. Your effective rate often isn't.»
3. Подзаголовок — **одно предложение**, ≤ 140 символов: «Upload a Balance CSV and see your real rate and the top driver behind it.» Всё про privacy уходит в trust-строку (п. 5).
4. CTA-пара: primary `Analyze my CSV — free`, secondary `See sample report`. Одинаковый размер, разный вес.
5. Trust-строка одной строкой, 14px, серым: `No OAuth · raw CSV is not stored · independent tool`.

Убрать из hero:
- pain-чипы (`International card fees` / `Refund fees not returned` / `Rate / payout drift`) — **перенести в блок Proof** как текстовые ссылки (не pill-кнопки) → закрывает P0-3 «chip ≠ button»;
- ссылки `Quick fee estimate first →` и `Case study (~$1,400) →` — переехать в Proof с явными лейблами `Read the case study` / `Fee estimate` (P1-4);
- абзац `Fee Auditor … Not affiliated with Stripe` — в футер (в футере он уже есть → просто удалить из hero, P1-3);
- сетку `TRUST_SIGNALS` из 6 пунктов — свернуть до trust-строки; полный список живёт на `/how-it-works` (P1-2);
- newsletter-форму — перенести в футер/блог;
- обе цитаты (`INDEPENDENT_FEEDBACK`, Ivan Chernov) — в Proof.

### R4 — Proof: живые числа вместо каталога

Новая секция сразу после hero. Содержимое:

- Заголовок вида `What one real export showed`.
- Ряд из 3–4 чисел (из существующего case study, не выдумывать): `$3,597.77 fees` · `3.82% processing` · `4.02% all-in` · `447 high-fee charges`.
- Скрин `/screenshots/report-preview.png` (перенести из hero сюда, оставить `priority`, если он всё ещё в первом вьюпорте — иначе снять `priority`).
- Три pain-ссылки текстом (из R3) — как «What usually drives it».
- Одна цитата (`INDEPENDENT_FEEDBACK`), вторую (Ivan Chernov) оставить только если нужен объём — иначе одна.
- Ссылка `Read the case study →` на `/blog/how-i-found-1400-in-hidden-stripe-fees`.

Удаляется отдельная секция `Case study` (её числа и CTA поглощены Proof).

### R5 — Interaction: 3 карточки вместо двух каталогов

- Оставить `HOW_IT_WORKS` (3 шага) как единственный «объясняющий» блок; заголовок → `How we find them`.
- Секцию `WHAT_YOU_GET` (5 карточек) **удалить** с `/`; ключевые 3 пункта (rate vs all-in, why higher, refund leakage) вписать одной строкой в соответствующие шаги.
- Секцию `CALCULATOR_VS_AUDIT` (2 карточки) **удалить** с `/` — контент дублирует `/stripe-fee-calculator`; вместо неё внизу секции secondary-ссылка `Fee estimate without CSV →`.
- Секцию `Quick fit check` **удалить** с `/` (содержание переносится в FAQ одним вопросом «Is this useful for me?»).
- Секцию `StripeFeeMiniEstimate` **убрать** с `/` — она конкурирует с upload; калькулятор остаётся отдельной страницей.
- Chrome helper блок — **перенести** ниже Result (перед FAQ) или в футер; не выше Proof.
- Завершить секцию secondary CTA `See sample report →` (кампания `mid_sample` сохраняется).

### R6 — Result: ясность оффера + финальный CTA

- Секция `#pricing`: оставить максимум 3 карточки текущей логики beta/после-беты + Monitor.
- Добавить **одну строку** над карточками: `$12 = one CSV audit. $9/mo = a monthly reminder to re-check. Not a subscription to a dashboard.` (P2-1).
- Блок `PRICING_COMPARISON` (Spreadsheet / Broad SaaS / Fee Auditor) **удалить** с `/`.
- Подблок `Narrow audit vs heavy tools` **удалить**; ссылка `Estimate first →` остаётся одной строкой.
- Финальный primary CTA `Analyze my CSV` (кампания `footer` сохраняется).

### R7 — Типографика (P1-1)

Пройти `/`, `/analyze`: body ≥ 16px (`text-base`), вторичный текст 14px (`text-sm`), 12px (`text-xs`) — только legal и сноски. Заменить `text-sm` на `text-base` в основных описательных абзацах секций; `text-[10px]` не использовать.

### R8 — `/analyze`: тот же контракт

- H1 оставить. Подзаголовок — одна строка.
- `AdvertiserIdentityBanner` — **вниз страницы** (под upload-зоной), не между заголовком и загрузкой (P1-3).
- Убедиться, что trust-строка встречается один раз (P1-2).

### R9 — Инструментовка Time to Upload

- Добавить в события `funnel_landing_cta` / `funnel_sample_cta` проп `ms_since_load` (округлять до 500 мс).
- На `/analyze` — тот же проп в `funnel_csv_loaded`.
- Ничего не переименовывать: существующие имена событий и UTM-кампании сохраняются, иначе ломается `scripts/funnel-segmentation.sql`.

### R10 — Проверки перед коммитом

- `npm run lint` и `npm run build` чистые.
- Метаданные, canonical, все три JSON-LD блока (`FAQ`, `SoftwareApplication`, `Organization`) — без изменений.
- Ни один URL не удалён; `sitemap` не менялся.
- В коммит попадают только файлы скоупа (`app/page.tsx`, `components/LandingNav.tsx`, `app/analyze/page.tsx`, новые компоненты). Не добавлять грязные файлы из `app/report/**`, `lib/**`.

---

## 5. Приоритет исполнения

| Волна | Задачи | Смысл |
|---|---|---|
| A | R2, R3, R1 | Первый экран: одно решение, нет «10s», нет шума в nav |
| B | R4, R5 | Proof вместо каталога фич, минус 4 секции |
| C | R6, R7, R8 | Ясность оффера, шрифты, `/analyze` |
| D | R9, R10 | Замер и чистый коммит |

Волна A самодостаточна: можно деплоить отдельно.

---

## 6. Критерий готовности

1. На 390px первый CTA виден без скролла; видно ровно два действия.
2. Холодный прогон 60 c: человек говорит «это демо» vs «загрузить свой CSV», не кликает в теги по ошибке.
3. Сообщения `no OAuth` / `CSV not stored` / `independent` встречаются на `/` **по одному разу** до FAQ.
4. Секций на `/` — 6 или меньше.
5. Ни одна SEO-страница не удалена, build зелёный.

---

## 7. Что специально отложено

- Интерактивный отчёт прямо на `/` (эссе предлагает) — только после ≥5 реальных загрузок; сейчас Proof = числа + скрин.
- Uploader прямо в hero главной — сначала измерить Time to Upload на текущей паре CTA.
- Пересмотр цены, годовые планы, hero-калькулятор, ACH-тумблеры, MoR-сравнение — по growth plan, вне этого скоупа.
- Копирайт-проход инфостилем по блогу — только после замера GSC CTR.
