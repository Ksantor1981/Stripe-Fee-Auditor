import crypto from "crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { encryptSecretPayload, decryptSecretPayload } from "@/lib/token-crypto";
import type { Attribution } from "@/lib/attribution";
import type { AnalysisResult } from "./fee-analyzer";

let sqlClient: NeonQueryFunction<false, false> | undefined;

function getSqlClient(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

/** Lazy Neon client — avoids requiring DATABASE_URL during `next build`. */
const sql = ((strings: TemplateStringsArray, ...params: unknown[]) =>
  getSqlClient()(strings, ...params)) as NeonQueryFunction<false, false>;

export default sql;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportRow {
  id: string;
  session_id: string;
  blob_url: string | null;
  result: AnalysisResult | null;
  is_paid: boolean;
  email: string | null;
  access_token_hash: string | null;
  created_at: string;
  expires_at: string;
}

export type ReportRetention = "free_preview" | "beta_full_access";

export interface CheckoutSessionRow {
  checkoutId: string;
  reportId: string;
  accessToken: string;
  accessTokenHash: string;
  plan: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function createReportAccessToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** Optional REPORT_TOKEN_SALT (pepper): when non-empty, strengthens hashes vs rainbow tables. Empty = legacy SHA256(token) only. */
export function hashReportAccessToken(token: string): string {
  const pepper = process.env.REPORT_TOKEN_SALT ?? "";
  const h = crypto.createHash("sha256");
  if (pepper) h.update(pepper, "utf8");
  h.update(token, "utf8");
  return h.digest("hex");
}

let checkoutSessionsTableReady = false;

async function ensureCheckoutSessionsTable(): Promise<void> {
  if (checkoutSessionsTableReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS checkout_sessions (
      checkout_id TEXT PRIMARY KEY,
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      access_token_ciphertext TEXT NOT NULL,
      access_token_hash TEXT NOT NULL,
      plan TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
    )
  `;

  await sql`ALTER TABLE checkout_sessions ADD COLUMN IF NOT EXISTS access_token_ciphertext TEXT`;
  await sql`ALTER TABLE checkout_sessions DROP COLUMN IF EXISTS access_token`;

  await sql`
    CREATE INDEX IF NOT EXISTS checkout_sessions_report_id_idx
    ON checkout_sessions(report_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS checkout_sessions_expires_at_idx
    ON checkout_sessions(expires_at)
  `;

  checkoutSessionsTableReady = true;
}

let reportsColumnsReady = false;

/**
 * Lazily add columns added after the initial migration so deploys work without
 * a manual migration step. Guarded by a module flag so the ALTERs run at most
 * once per warm instance instead of on every query.
 */
async function ensureReportsColumns(): Promise<void> {
  if (reportsColumnsReady) return;
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS access_token_ciphertext TEXT`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS follow_up_sent_at TIMESTAMPTZ`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_captured_at TIMESTAMPTZ`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS utm_source TEXT`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS utm_medium TEXT`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS utm_campaign TEXT`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS utm_content TEXT`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS landing_path TEXT`.catch(() => null);
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS referrer TEXT`.catch(() => null);
  reportsColumnsReady = true;
}

export async function createReport(params: {
  sessionId: string;
  blobUrl: string | null;
  result: AnalysisResult;
  accessTokenHash: string;
  accessTokenCiphertext?: string;
  retention?: ReportRetention;
  attribution?: Attribution;
}): Promise<string> {
  await ensureReportsColumns();

  const attr = params.attribution ?? {};
  const rows = await sql`
    INSERT INTO reports (
      session_id, blob_url, result, access_token_hash, access_token_ciphertext,
      utm_source, utm_medium, utm_campaign, utm_content, landing_path, referrer,
      expires_at
    )
    VALUES (
      ${params.sessionId},
      ${params.blobUrl},
      ${JSON.stringify(params.result)},
      ${params.accessTokenHash},
      ${params.accessTokenCiphertext ?? null},
      ${attr.utm_source ?? null},
      ${attr.utm_medium ?? null},
      ${attr.utm_campaign ?? null},
      ${attr.utm_content ?? null},
      ${attr.landing_path ?? null},
      ${attr.referrer ?? null},
      NOW() + CASE
        WHEN ${params.retention === "beta_full_access"} THEN INTERVAL '30 days'
        ELSE INTERVAL '1 hour'
      END
    )
    RETURNING id
  `;
  return rows[0].id as string;
}

export interface FollowUpRow {
  id: string;
  email: string;
  access_token_ciphertext: string | null;
  all_in_fees: number | null;
  expires_at: string;
}

/**
 * Atomically claims up to `limit` reports for follow-up and marks them
 * as sent in the same statement. Uses FOR UPDATE SKIP LOCKED so parallel
 * cron runs never double-send the same report.
 *
 * Eligibility window: email captured ≥48 h ago (not report created),
 * report still lives ≥12 h, not yet paid, not already sent.
 */
export async function claimReportsForFollowUp(limit = 50): Promise<FollowUpRow[]> {
  // Ensure columns exist before querying them — handles the case where the cron
  // fires on a fresh deploy before any createReport/saveReportEmail has run.
  await ensureReportsColumns();

  const rows = await sql`
    UPDATE reports
    SET follow_up_sent_at = NOW()
    WHERE id IN (
      SELECT id FROM reports
      WHERE email IS NOT NULL
        AND is_paid = false
        AND follow_up_sent_at IS NULL
        AND expires_at > NOW() + INTERVAL '12 hours'
        AND email_captured_at IS NOT NULL
        AND email_captured_at < NOW() - INTERVAL '48 hours'
      ORDER BY email_captured_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING
      id::text,
      email,
      access_token_ciphertext,
      (result->>'allInFees')::numeric AS all_in_fees,
      expires_at
  `;
  return rows as FollowUpRow[];
}

export async function createCheckoutSession(params: {
  checkoutId: string;
  reportId: string;
  accessToken: string;
  plan: string;
}): Promise<void> {
  await ensureCheckoutSessionsTable();
  const accessTokenHash = hashReportAccessToken(params.accessToken);
  const accessTokenCiphertext = encryptSecretPayload(params.accessToken);

  await sql`
    INSERT INTO checkout_sessions (
      checkout_id,
      report_id,
      access_token_ciphertext,
      access_token_hash,
      plan,
      expires_at
    )
    VALUES (
      ${params.checkoutId},
      ${params.reportId},
      ${accessTokenCiphertext},
      ${accessTokenHash},
      ${params.plan},
      NOW() + INTERVAL '24 hours'
    )
    ON CONFLICT (checkout_id) DO UPDATE SET
      report_id = EXCLUDED.report_id,
      access_token_ciphertext = EXCLUDED.access_token_ciphertext,
      access_token_hash = EXCLUDED.access_token_hash,
      plan = EXCLUDED.plan,
      expires_at = EXCLUDED.expires_at
  `;
}

export async function getCheckoutSession(checkoutId: string): Promise<CheckoutSessionRow | null> {
  await ensureCheckoutSessionsTable();

  const rows = await sql`
    SELECT
      checkout_id,
      report_id::text AS report_id,
      access_token_ciphertext,
      access_token_hash,
      plan
    FROM checkout_sessions
    WHERE checkout_id = ${checkoutId}
      AND expires_at > NOW()
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        checkout_id: string;
        report_id: string;
        access_token_ciphertext: string;
        access_token_hash: string;
        plan: string;
      }
    | undefined;

  if (!row) return null;

  return {
    checkoutId: row.checkout_id,
    reportId: row.report_id,
    accessToken: decryptSecretPayload(row.access_token_ciphertext),
    accessTokenHash: row.access_token_hash,
    plan: row.plan,
  };
}

export async function getReportWithAccess(id: string, accessToken: string): Promise<ReportRow | null> {
  if (!accessToken) return null;
  const rows = await sql`
    SELECT * FROM reports
    WHERE id = ${id}
      AND access_token_hash = ${hashReportAccessToken(accessToken)}
      AND expires_at > NOW()
  `;
  return (rows[0] as ReportRow) ?? null;
}

export async function extendReportForCheckout(id: string, accessToken: string): Promise<boolean> {
  if (!accessToken) return false;
  const rows = await sql`
    UPDATE reports
    SET expires_at = GREATEST(expires_at, NOW() + INTERVAL '24 hours')
    WHERE id = ${id}
      AND access_token_hash = ${hashReportAccessToken(accessToken)}
      AND expires_at > NOW()
    RETURNING id
  `;
  return rows.length > 0;
}

export async function processPaidWebhook(params: {
  eventId: string;
  eventName: string;
  reportId: string;
  email: string;
  accessToken: string;
}): Promise<"processed" | "duplicate" | "already_paid" | "report_not_found"> {
  if (!params.accessToken) return "report_not_found";

  const existingEvents = await sql`
    SELECT id
    FROM webhook_events
    WHERE id = ${params.eventId}
    LIMIT 1
  `;

  if (existingEvents.length > 0) return "duplicate";

  const updated = await sql`
    UPDATE reports
    SET
      is_paid = true,
      email = COALESCE(NULLIF(${params.email}, ''), email),
      paid_at = COALESCE(paid_at, NOW()),
      expires_at = GREATEST(expires_at, NOW() + INTERVAL '30 days')
    WHERE id = ${params.reportId}
      AND access_token_hash = ${hashReportAccessToken(params.accessToken)}
      AND is_paid = false
    RETURNING id
  `;

  if (updated.length === 0) {
    const reports = await sql`
      SELECT is_paid
      FROM reports
      WHERE id = ${params.reportId}
        AND access_token_hash = ${hashReportAccessToken(params.accessToken)}
      LIMIT 1
    `;

    return reports[0]?.is_paid === true ? "already_paid" : "report_not_found";
  }

  const insertedEvents = await sql`
    INSERT INTO webhook_events (id, event_name)
    VALUES (${params.eventId}, ${params.eventName})
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  return insertedEvents.length > 0 ? "processed" : "duplicate";
}

export async function saveReportEmail(id: string, email: string, accessToken: string): Promise<boolean> {
  if (!accessToken) return false;

  await ensureReportsColumns();

  // Extend to ≥72 h so users can return via the email link.
  // Record email_captured_at so the follow-up cron counts from this moment,
  // not from report creation.
  // Idempotent by design: browser back/checkout cancel can show a cached
  // EmailGate after email was already saved, and that should still unlock.
  const rows = await sql`
    UPDATE reports
    SET
      email = COALESCE(email, ${email}),
      email_captured_at = COALESCE(email_captured_at, NOW()),
      expires_at = GREATEST(expires_at, NOW() + INTERVAL '72 hours')
    WHERE id = ${id}
      AND access_token_hash = ${hashReportAccessToken(accessToken)}
      AND expires_at > NOW()
    RETURNING id
  `;
  return rows.length > 0;
}

export async function consumeIpRequest(ip: string, limit: number): Promise<boolean> {
  const rows = await sql`
    WITH lock AS (
      SELECT pg_advisory_xact_lock(hashtext(${ip}))
    ),
    recent AS (
      SELECT COUNT(*)::int AS cnt
      FROM rate_limits, lock
      WHERE ip = ${ip}
        AND created_at > NOW() - INTERVAL '1 day'
    ),
    inserted AS (
      INSERT INTO rate_limits (ip)
      SELECT ${ip}
      FROM recent
      WHERE cnt < ${limit}
      RETURNING id
    )
    SELECT EXISTS(SELECT 1 FROM inserted) AS allowed
  `;

  return rows[0]?.allowed === true;
}

let monitorWaitlistTableReady = false;

async function ensureMonitorWaitlistTable(): Promise<void> {
  if (monitorWaitlistTableReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS monitor_waitlist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
      source TEXT NOT NULL DEFAULT 'report',
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      landing_path TEXT,
      referrer TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Backfill columns on tables created before attribution was added.
  await sql`ALTER TABLE monitor_waitlist ADD COLUMN IF NOT EXISTS utm_source TEXT`.catch(() => null);
  await sql`ALTER TABLE monitor_waitlist ADD COLUMN IF NOT EXISTS utm_medium TEXT`.catch(() => null);
  await sql`ALTER TABLE monitor_waitlist ADD COLUMN IF NOT EXISTS utm_campaign TEXT`.catch(() => null);
  await sql`ALTER TABLE monitor_waitlist ADD COLUMN IF NOT EXISTS utm_content TEXT`.catch(() => null);
  await sql`ALTER TABLE monitor_waitlist ADD COLUMN IF NOT EXISTS landing_path TEXT`.catch(() => null);
  await sql`ALTER TABLE monitor_waitlist ADD COLUMN IF NOT EXISTS referrer TEXT`.catch(() => null);

  await sql`
    CREATE INDEX IF NOT EXISTS monitor_waitlist_created_at_idx
    ON monitor_waitlist (created_at DESC)
  `;

  monitorWaitlistTableReady = true;
}

export type WaitlistInsertResult = "inserted" | "duplicate";

export async function insertMonitorWaitlistSignup(params: {
  email: string;
  reportId?: string | null;
  source?: string;
  attribution?: Attribution;
}): Promise<WaitlistInsertResult> {
  await ensureMonitorWaitlistTable();

  const attr = params.attribution ?? {};
  const rows = await sql`
    INSERT INTO monitor_waitlist (
      email, report_id, source,
      utm_source, utm_medium, utm_campaign, utm_content, landing_path, referrer
    )
    VALUES (
      ${params.email},
      ${params.reportId ?? null},
      ${params.source ?? "report"},
      ${attr.utm_source ?? null},
      ${attr.utm_medium ?? null},
      ${attr.utm_campaign ?? null},
      ${attr.utm_content ?? null},
      ${attr.landing_path ?? null},
      ${attr.referrer ?? null}
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;

  return rows.length > 0 ? "inserted" : "duplicate";
}

let newsletterSubscribersTableReady = false;

async function ensureNewsletterSubscribersTable(): Promise<void> {
  if (newsletterSubscribersTableReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'landing',
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      landing_path TEXT,
      referrer TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ,
      last_reminded_at TIMESTAMPTZ,
      reminder_count INT NOT NULL DEFAULT 0
    )
  `;

  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'landing'`.catch(
    () => null
  );
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS utm_source TEXT`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS utm_medium TEXT`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS utm_campaign TEXT`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS utm_content TEXT`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS landing_path TEXT`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS referrer TEXT`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ`.catch(() => null);
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS reminder_count INT NOT NULL DEFAULT 0`.catch(
    () => null
  );

  await sql`
    CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx
    ON newsletter_subscribers (created_at DESC)
  `;

  newsletterSubscribersTableReady = true;
}

export type NewsletterInsertResult = "inserted" | "duplicate";

export async function insertNewsletterSubscriber(params: {
  email: string;
  source?: string;
  attribution?: Attribution;
}): Promise<NewsletterInsertResult> {
  await ensureNewsletterSubscribersTable();

  const attr = params.attribution ?? {};
  const rows = await sql`
    INSERT INTO newsletter_subscribers (
      email, source,
      utm_source, utm_medium, utm_campaign, utm_content, landing_path, referrer
    )
    VALUES (
      ${params.email},
      ${params.source ?? "landing"},
      ${attr.utm_source ?? null},
      ${attr.utm_medium ?? null},
      ${attr.utm_campaign ?? null},
      ${attr.utm_content ?? null},
      ${attr.landing_path ?? null},
      ${attr.referrer ?? null}
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;

  return rows.length > 0 ? "inserted" : "duplicate";
}

export type MonthlyReminderAudience = "monitor" | "newsletter";

export interface MonthlyReminderRecipient {
  email: string;
  audience: MonthlyReminderAudience;
  reminder_count: number;
}

export async function claimNewsletterSubscribersForMonthlyReminder(limit = 250): Promise<MonthlyReminderRecipient[]> {
  await ensureNewsletterSubscribersTable();

  const rows = await sql`
    WITH claimed AS (
      SELECT email
      FROM newsletter_subscribers
      WHERE unsubscribed_at IS NULL
        AND (
          last_reminded_at IS NULL
          OR last_reminded_at < NOW() - INTERVAL '25 days'
        )
      ORDER BY COALESCE(last_reminded_at, created_at), created_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE newsletter_subscribers n
    SET
      last_reminded_at = NOW(),
      reminder_count = COALESCE(n.reminder_count, 0) + 1
    FROM claimed
    WHERE n.email = claimed.email
    RETURNING n.email, n.reminder_count
  `;

  return rows.map((row) => ({
    email: row.email as string,
    audience: "newsletter",
    reminder_count: Number(row.reminder_count ?? 0),
  }));
}

export async function unsubscribeNewsletterSubscriber(email: string): Promise<boolean> {
  await ensureNewsletterSubscribersTable();

  const rows = await sql`
    UPDATE newsletter_subscribers
    SET unsubscribed_at = NOW()
    WHERE email = ${email}
      AND unsubscribed_at IS NULL
    RETURNING id
  `;

  return rows.length > 0;
}

let monitorSubscribersTableReady = false;

async function ensureMonitorSubscribersTable(): Promise<void> {
  if (monitorSubscribersTableReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS monitor_subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'polar',
      polar_product_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_paid_at TIMESTAMPTZ,
      last_reminded_at TIMESTAMPTZ,
      reminder_count INT NOT NULL DEFAULT 0
    )
  `;

  await sql`ALTER TABLE monitor_subscribers ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'polar'`.catch(
    () => null
  );
  await sql`ALTER TABLE monitor_subscribers ADD COLUMN IF NOT EXISTS polar_product_id TEXT`.catch(() => null);
  await sql`ALTER TABLE monitor_subscribers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`.catch(
    () => null
  );
  await sql`ALTER TABLE monitor_subscribers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.catch(
    () => null
  );
  await sql`ALTER TABLE monitor_subscribers ADD COLUMN IF NOT EXISTS last_paid_at TIMESTAMPTZ`.catch(() => null);
  await sql`ALTER TABLE monitor_subscribers ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ`.catch(() => null);
  await sql`ALTER TABLE monitor_subscribers ADD COLUMN IF NOT EXISTS reminder_count INT NOT NULL DEFAULT 0`.catch(
    () => null
  );

  await sql`
    CREATE INDEX IF NOT EXISTS monitor_subscribers_updated_at_idx
    ON monitor_subscribers (updated_at DESC)
  `;

  monitorSubscribersTableReady = true;
}

export async function upsertMonitorSubscriberFromPayment(params: {
  email: string;
  productId?: string | null;
  source?: string;
}): Promise<{ isNewSubscriber: boolean }> {
  await ensureMonitorSubscribersTable();

  const rows = await sql`
    INSERT INTO monitor_subscribers (
      email, source, polar_product_id, status, last_paid_at, updated_at
    )
    VALUES (
      ${params.email},
      ${params.source ?? "polar"},
      ${params.productId ?? null},
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      source = EXCLUDED.source,
      polar_product_id = COALESCE(EXCLUDED.polar_product_id, monitor_subscribers.polar_product_id),
      status = 'active',
      last_paid_at = NOW(),
      updated_at = NOW()
    RETURNING (xmax = 0) AS is_new
  `;

  return { isNewSubscriber: Boolean(rows[0]?.is_new) };
}

export async function isActiveMonitorSubscriber(email?: string | null): Promise<boolean> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  await ensureMonitorSubscribersTable();

  const rows = await sql`
    SELECT 1
    FROM monitor_subscribers
    WHERE lower(email) = ${normalizedEmail}
      AND status = 'active'
    LIMIT 1
  `;

  return rows.length > 0;
}

export async function claimMonitorSubscribersForMonthlyReminder(limit = 250): Promise<MonthlyReminderRecipient[]> {
  await ensureMonitorSubscribersTable();

  const rows = await sql`
    WITH claimed AS (
      SELECT email
      FROM monitor_subscribers
      WHERE status = 'active'
        AND (
          last_reminded_at IS NULL
          OR last_reminded_at < NOW() - INTERVAL '25 days'
        )
      ORDER BY COALESCE(last_reminded_at, last_paid_at, created_at), created_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE monitor_subscribers m
    SET
      last_reminded_at = NOW(),
      reminder_count = COALESCE(m.reminder_count, 0) + 1,
      updated_at = NOW()
    FROM claimed
    WHERE m.email = claimed.email
    RETURNING m.email, m.reminder_count
  `;

  return rows.map((row) => ({
    email: row.email as string,
    audience: "monitor",
    reminder_count: Number(row.reminder_count ?? 0),
  }));
}
