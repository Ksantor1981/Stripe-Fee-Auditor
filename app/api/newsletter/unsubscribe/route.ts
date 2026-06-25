import { NextRequest, NextResponse } from "next/server";
import { unsubscribeNewsletterSubscriber } from "@/lib/db";
import { verifyNewsletterUnsubscribe } from "@/lib/newsletter-token";
import { isValidWaitlistEmail, normalizeWaitlistEmail } from "@/lib/waitlist";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(req: NextRequest) {
  const email = normalizeWaitlistEmail(req.nextUrl.searchParams.get("email") ?? "");
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!isValidWaitlistEmail(email) || !token) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }

  if (!verifyNewsletterUnsubscribe(email, token)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 401 });
  }

  await unsubscribeNewsletterSubscriber(email);
  const safeEmail = escapeHtml(email);

  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Unsubscribed — Stripe Fee Auditor</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #111827; }
      main { max-width: 520px; margin: 12vh auto; padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <main>
      <h1>You are unsubscribed.</h1>
      <p>No more monthly Stripe fee tips will be sent to ${safeEmail}.</p>
      <p><a href="/">Back to Fee Auditor</a></p>
    </main>
  </body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
