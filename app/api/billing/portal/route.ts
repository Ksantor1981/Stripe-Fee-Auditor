import { NextRequest, NextResponse } from "next/server";
import { verifyBillingPortalToken } from "@/lib/billing-token";
import { buildCustomerPortalUrlForEmail } from "@/lib/polar";
import { isValidWaitlistEmail, normalizeWaitlistEmail } from "@/lib/waitlist";
import { logOpsError } from "@/lib/ops-log";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

function htmlPage(title: string, body: string, status = 200): NextResponse {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — Stripe Fee Auditor</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #111827; }
      main { max-width: 520px; margin: 12vh auto; padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; }
      a { color: #2563eb; }
      p { line-height: 1.55; color: #4b5563; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      ${body}
      <p><a href="/monitor">Back to Fee Monitor</a></p>
    </main>
  </body>
</html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const email = normalizeWaitlistEmail(req.nextUrl.searchParams.get("email") ?? "");
  const expires = req.nextUrl.searchParams.get("expires") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!isValidWaitlistEmail(email) || !expires || !token) {
    return htmlPage("Invalid billing link", "<p>Request a fresh billing link from the Fee Monitor page.</p>", 400);
  }

  if (!verifyBillingPortalToken(email, expires, token)) {
    return htmlPage("Billing link expired", "<p>For safety, billing links expire quickly. Request a fresh one.</p>", 401);
  }

  try {
    const portalUrl = await buildCustomerPortalUrlForEmail(email);
    if (!portalUrl) {
      return htmlPage(
        "No billing profile found",
        "<p>We could not find a Polar customer profile for this email. If you paid with a different address, request a link for that email.</p>",
        404
      );
    }

    return NextResponse.redirect(portalUrl);
  } catch (err) {
    logOpsError("billing_portal_open_failed", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
    return htmlPage("Billing portal unavailable", "<p>Polar billing is temporarily unavailable. Try again in a minute.</p>", 503);
  }
}
