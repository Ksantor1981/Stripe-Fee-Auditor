# Instructions for Stripe Fee Auditor

## Scope

Работать только в проекте `Stripe Fee Auditor` и не смешивать код с другими проектами workspace без явного указания.

## Product focus

- MVP: анализ Stripe Balance CSV
- Core output: effective fee rate, fee breakdown, anomalies, period comparison
- Business model: free preview + paid unlock

## Engineering principles

- Минимальные точечные изменения без лишних рефакторингов
- Явная валидация входных данных и graceful fallback
- Детерминированные расчеты (одинаковый input -> одинаковый output)
- Приватность данных по умолчанию: удаление загрузок по TTL

## Delivery sequence

1. Setup инфраструктуры и деплой-пайплайна
2. UI flow (`/` -> `/analyze` -> `/report/[id]`)
3. API и алгоритм анализа
4. Paywall, экспорты, legal/SEO
5. Нагрузочная и edge-case проверка CSV
