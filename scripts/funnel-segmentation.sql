-- Funnel segmentation queries for Stripe Fee Auditor.
-- Run in the Neon SQL console. Read-only.
--
-- Attribution columns (utm_source/medium/campaign/content, landing_path,
-- referrer) are first-touch, set by middleware.ts on the visitor's first page
-- view and persisted on report/waitlist creation. Data is only available for
-- traffic that arrived AFTER the attribution deploy; older rows have NULLs.
--
-- Note on internal CTAs: clicks like hero_primary / hero_sample / beta_banner
-- already arrive as utm_campaign (see TrackedLink usage in app/page.tsx), so
-- CTA placement for internal navigation is captured in utm_campaign below.
--
-- Time to Upload (Jul 2026 homepage UX): client events funnel_landing_cta,
-- funnel_sample_cta, and funnel_csv_loaded include props.ms_since_load (ms from
-- page load, rounded to 500). Grep Vercel logs: funnel_event + ms_since_load.

-- 1. Report funnel by first-touch channel (excludes sample/demo uploads).
SELECT
  COALESCE(
    utm_source,
    CASE WHEN referrer IS NOT NULL THEN 'referral' ELSE 'direct/organic' END
  )                                   AS source,
  utm_medium,
  utm_campaign,
  COUNT(*)                            AS uploads,
  COUNT(email)                        AS emails,
  COUNT(*) FILTER (WHERE is_paid)     AS paid
FROM reports
WHERE session_id <> 'demo-sample'
GROUP BY 1, 2, 3
ORDER BY uploads DESC;

-- 2. Report funnel by entry point: SEO/blog vs landing vs direct /analyze vs /monitor.
SELECT
  CASE
    WHEN landing_path LIKE '/blog/%'
      OR landing_path LIKE '/why-%'
      OR landing_path LIKE '/stripe-%'  THEN 'seo_content'
    WHEN landing_path = '/'             THEN 'landing'
    WHEN landing_path LIKE '/analyze%'  THEN 'analyze_direct'
    WHEN landing_path LIKE '/monitor%'  THEN 'monitor'
    ELSE COALESCE(landing_path, 'unknown')
  END                                 AS entry,
  COUNT(*)                            AS uploads,
  COUNT(email)                        AS emails,
  COUNT(*) FILTER (WHERE is_paid)     AS paid
FROM reports
WHERE session_id <> 'demo-sample'
GROUP BY 1
ORDER BY uploads DESC;

-- 3. Monitor waitlist by channel (kept as a separate pre-sale funnel).
SELECT
  source,
  COALESCE(utm_source, 'direct/organic') AS utm_source,
  utm_campaign,
  COUNT(*)                               AS signups
FROM monitor_waitlist
GROUP BY 1, 2, 3
ORDER BY signups DESC;

-- 4. Headline conversion (paid funnel health). Watch this after beta is off.
SELECT
  COUNT(*)                          AS uploads,
  COUNT(email)                      AS emails,
  COUNT(*) FILTER (WHERE is_paid)   AS paid,
  ROUND(100.0 * COUNT(email)      / NULLIF(COUNT(*), 0), 1)                       AS email_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_paid) / NULLIF(COUNT(email), 0), 1)     AS email_to_paid_pct
FROM reports
WHERE session_id <> 'demo-sample';

-- 5. Fixed 14-day acquisition test: 2026-07-29 through 2026-08-11 UTC.
-- Run on/after 2026-08-12. Diagnosis views are client analytics events and must
-- be read separately from `free_diagnosis_view` in GA4/Vercel logs.
WITH acquisition_reports AS (
  SELECT
    COALESCE(utm_source, 'direct/organic') AS source,
    COALESCE(utm_medium, '')               AS medium,
    COALESCE(utm_campaign, '')             AS campaign,
    email,
    is_paid,
    created_at
  FROM reports
  WHERE session_id <> 'demo-sample'
    AND created_at >= TIMESTAMPTZ '2026-07-29 00:00:00+00'
    AND created_at <  TIMESTAMPTZ '2026-08-12 00:00:00+00'
)
SELECT
  source,
  medium,
  campaign,
  COUNT(*)                        AS uploads,
  COUNT(email)                    AS emails,
  COUNT(*) FILTER (WHERE is_paid) AS paid,
  MIN(created_at)                 AS first_upload,
  MAX(created_at)                 AS last_upload
FROM acquisition_reports
WHERE source IN ('google', 'partner', 'linkedin')
GROUP BY 1, 2, 3
ORDER BY uploads DESC, source, campaign;

-- 6. Upload decision gate for the same test window.
WITH acquisition_total AS (
  SELECT COUNT(*)::int AS uploads
  FROM reports
  WHERE session_id <> 'demo-sample'
    AND created_at >= TIMESTAMPTZ '2026-07-29 00:00:00+00'
    AND created_at <  TIMESTAMPTZ '2026-08-12 00:00:00+00'
    AND COALESCE(utm_source, '') IN ('google', 'partner', 'linkedin')
)
SELECT
  uploads,
  CASE
    WHEN uploads >= 5 THEN 'continue_best_channel'
    WHEN uploads < 1 THEN 'inspect_clicks_then_fix_trust_or_reframe_acquisition'
    ELSE 'inspect_step_dropoff_before_changing_price_or_seo'
  END AS upload_decision
FROM acquisition_total;
