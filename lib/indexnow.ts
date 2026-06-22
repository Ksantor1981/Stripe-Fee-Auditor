const INDEXNOW_KEY = "feeauditor2026index";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

const siteHost = () =>
  (process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

/** Notify Bing/Yandex (IndexNow) that URLs changed — helps discovery; Google uses sitemap + GSC. */
export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; status: number }> {
  const host = siteHost();
  const normalized = urls.map((u) => (u.startsWith("http") ? u : `https://${host}${u}`));

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
      urlList: normalized,
    }),
  });

  return { ok: res.ok, status: res.status };
}

export const INDEXNOW_NEW_ARTICLE_PATH = "/blog/cross-border-stripe-fees-migration-2026";
