import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { logOpsError } from "@/lib/ops-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckStatus = "ok" | "fail" | "skip";

function envConfigured(name: string): CheckStatus {
  const v = process.env[name]?.trim();
  return v ? "ok" : "skip";
}

function polarProductsDistinct(): CheckStatus {
  const reportProduct = process.env.POLAR_PRODUCT_PRO?.trim();
  const monitorProduct = process.env.POLAR_PRODUCT_MONITOR_MONTHLY?.trim();
  if (!reportProduct || !monitorProduct) return "skip";
  return reportProduct === monitorProduct ? "fail" : "ok";
}

/** Public liveness/readiness for uptime monitors (UptimeRobot, Better Stack, etc.). */
export async function GET() {
  const checks: Record<string, CheckStatus> = {
    database: "fail",
    cron_secret: envConfigured("CRON_SECRET"),
    polar_webhook: envConfigured("POLAR_WEBHOOK_SECRET"),
    polar_checkout: envConfigured("POLAR_ACCESS_TOKEN"),
    polar_product: envConfigured("POLAR_PRODUCT_PRO"),
    polar_monitor_product: envConfigured("POLAR_PRODUCT_MONITOR_MONTHLY"),
    polar_products_distinct: polarProductsDistinct(),
    polar_server: process.env.POLAR_SERVER?.trim() ? "ok" : "skip",
    database_url: envConfigured("DATABASE_URL"),
    billing_portal_secret: envConfigured("BILLING_PORTAL_SECRET"),
  };

  try {
    await sql`SELECT 1 AS ok`;
    checks.database = "ok";
  } catch (err) {
    logOpsError("health_database_fail", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
  }

  const healthy = checks.database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "stripe-fee-auditor",
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      ts: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
