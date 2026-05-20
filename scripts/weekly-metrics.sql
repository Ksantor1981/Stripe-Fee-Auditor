-- Weekly product metrics (run in Neon SQL editor).
-- Adjust date range as needed.

-- Uploads (exclude demo sample)
SELECT count(*) AS reports_uploaded
FROM reports
WHERE session_id <> 'demo-sample'
  AND created_at >= now() - interval '7 days';

-- Paid unlocks last 7 days
SELECT count(*) AS paid_reports
FROM reports
WHERE is_paid = true
  AND created_at >= now() - interval '7 days';

-- Funnel snapshot (all time, non-demo)
SELECT
  count(*) FILTER (WHERE email IS NOT NULL) AS with_email,
  count(*) FILTER (WHERE is_paid) AS paid_total,
  count(*) AS total_reports
FROM reports
WHERE session_id <> 'demo-sample';
