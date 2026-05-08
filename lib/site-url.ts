/** Canonical site origin (no trailing slash). Used for JSON-LD and absolute URLs. */
export function getSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://feeauditor.com";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
