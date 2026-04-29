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
  created_at: string;
  expires_at: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function createReport(params: {
  sessionId: string;
  blobUrl: string;
  result: AnalysisResult;
}): Promise<string> {
  const rows = await sql`
    INSERT INTO reports (session_id, blob_url, result, expires_at)
    VALUES (
      ${params.sessionId},
      ${params.blobUrl},
      ${JSON.stringify(params.result)},
      NOW() + INTERVAL '1 hour'
    )
    RETURNING id
  `;
  return rows[0].id as string;
}

export async function getReport(id: string): Promise<ReportRow | null> {
  const rows = await sql`
    SELECT * FROM reports WHERE id = ${id} AND expires_at > NOW()
  `;
  return (rows[0] as ReportRow) ?? null;
}

export async function markReportPaid(id: string, email: string): Promise<void> {
  await sql`
    UPDATE reports SET is_paid = true, email = ${email} WHERE id = ${id}
  `;
}

export async function countReportsForIp(ip: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) as cnt FROM rate_limits
    WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '1 day'
  `;
  return Number(rows[0].cnt);
}

export async function recordIpRequest(ip: string): Promise<void> {
  await sql`INSERT INTO rate_limits (ip) VALUES (${ip})`;
}
