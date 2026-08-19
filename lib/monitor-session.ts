import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

const COOKIE_NAME = "sfa_monitor";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  const value =
    process.env.BILLING_PORTAL_SECRET?.trim() ||
    process.env.REPORT_TOKEN_SALT?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.CHECKOUT_TOKEN_ENCRYPTION_KEY?.trim();
  if (!value || value.length < 32) throw new Error("A 32+ character monitor session secret is required");
  return value;
}

function signature(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload, "utf8").digest("base64url");
}

function encode(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email: email.trim().toLowerCase(), exp: Date.now() + MAX_AGE_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

function decode(value?: string): string | null {
  try {
    if (!value) return null;
    const [payload, actual] = value.split(".");
    if (!payload || !actual) return null;
    const expected = signature(payload);
    const a = Buffer.from(actual);
    const e = Buffer.from(expected);
    if (a.length !== e.length || !crypto.timingSafeEqual(a, e)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: unknown; exp?: unknown };
    if (typeof parsed.email !== "string" || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return parsed.email.trim().toLowerCase() || null;
  } catch { return null; }
}

export function appendMonitorSessionCookie(response: NextResponse, email: string): void {
  response.cookies.set(COOKIE_NAME, encode(email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE_SECONDS });
}

export function getMonitorSessionEmailFromCookies(cookies: Pick<RequestCookies, "get">): string | null {
  return decode(cookies.get(COOKIE_NAME)?.value);
}

export function getMonitorSessionEmail(request: NextRequest): string | null {
  return getMonitorSessionEmailFromCookies(request.cookies);
}
