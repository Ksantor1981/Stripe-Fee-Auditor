import crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import type { AnalysisResult } from "./fee-analyzer";

const sql = neon(process.env.DATABASE_URL!);
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

export async function createReport(params: {
  sessionId: string;
  blobUrl: string | null;
  result: AnalysisResult;
  accessTokenHash: string;
}): Promise<string> {
  const rows = await sql`
    INSERT INTO reports (session_id, blob_url, result, access_token_hash, expires_at)
    VALUES (
      ${params.sessionId},
      ${params.blobUrl},
      ${JSON.stringify(params.result)},
      ${params.accessTokenHash},
      NOW() + INTERVAL '1 hour'
    )
    RETURNING id
  `;
  return rows[0].id as string;
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
    SET expires_at = GREATEST(expires_at, NOW() + INTERVAL '2 hours')
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
}): Promise<"processed" | "duplicate" | "report_not_found"> {
  if (!params.accessToken) return "report_not_found";

  const rows = await sql`
    WITH event AS (
      INSERT INTO webhook_events (id, event_name)
      VALUES (${params.eventId}, ${params.eventName})
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    ),
    updated AS (
      UPDATE reports
      SET
        is_paid = true,
        email = COALESCE(NULLIF(${params.email}, ''), email),
        paid_at = NOW(),
        expires_at = GREATEST(expires_at, NOW() + INTERVAL '30 days')
      FROM event
      WHERE reports.id = ${params.reportId}
        AND reports.access_token_hash = ${hashReportAccessToken(params.accessToken)}
      RETURNING reports.id
    )
    SELECT
      (SELECT COUNT(*)::int FROM event) AS event_count,
      (SELECT COUNT(*)::int FROM updated) AS updated_count
  `;

  if (Number(rows[0]?.event_count ?? 0) === 0) return "duplicate";
  return Number(rows[0]?.updated_count ?? 0) > 0 ? "processed" : "report_not_found";
}

export async function saveReportEmail(id: string, email: string, accessToken: string): Promise<boolean> {
  if (!accessToken) return false;
  const rows = await sql`
    UPDATE reports SET email = ${email}
    WHERE id = ${id}
      AND access_token_hash = ${hashReportAccessToken(accessToken)}
      AND expires_at > NOW()
      AND email IS NULL
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
