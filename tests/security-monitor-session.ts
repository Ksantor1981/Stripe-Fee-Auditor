import assert from "node:assert/strict";
import { NextResponse } from "next/server";
import {
  appendMonitorSessionCookie,
  getMonitorSessionEmailFromCookies,
} from "../lib/monitor-session";

process.env.BILLING_PORTAL_SECRET = "security-test-secret-".repeat(3);

const response = NextResponse.json({ ok: true });
appendMonitorSessionCookie(response, " Owner@Example.COM ");
const value = response.cookies.get("sfa_monitor")?.value;
assert.ok(value, "monitor session cookie must be set");

assert.equal(
  getMonitorSessionEmailFromCookies({ get: () => ({ name: "sfa_monitor", value }) }),
  "owner@example.com",
  "valid signed session must return normalized owner email"
);

const tampered = `${value.slice(0, -1)}${value.endsWith("a") ? "b" : "a"}`;
assert.equal(
  getMonitorSessionEmailFromCookies({ get: () => ({ name: "sfa_monitor", value: tampered }) }),
  null,
  "tampered monitor session must be rejected"
);

console.log("monitor-session security tests passed");
