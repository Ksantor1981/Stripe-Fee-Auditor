import { NextResponse } from "next/server";
import { INDEXNOW_NEW_ARTICLE_PATH, submitIndexNow } from "@/lib/indexnow";

function verifyCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Ping IndexNow after publishing — call once post-deploy. Google: also request indexing in GSC. */
export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com").replace(/\/$/, "");
  const urls = [
    `${base}${INDEXNOW_NEW_ARTICLE_PATH}`,
    `${base}/blog`,
    `${base}/sitemap.xml`,
  ];

  try {
    const result = await submitIndexNow(urls);
    return NextResponse.json({
      ok: result.ok,
      status: result.status,
      submitted: urls,
      note: "IndexNow covers Bing/Yandex. For Google, use Search Console → URL Inspection → Request indexing.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "IndexNow failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
