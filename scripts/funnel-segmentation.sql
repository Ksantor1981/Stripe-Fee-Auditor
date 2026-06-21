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
