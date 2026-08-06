/**
 * Live Chrome Web Store listing (Published for all).
 * Prefer the exact detail URL from CWS Dashboard → View in Chrome Web Store.
 * Env override: NEXT_PUBLIC_CHROME_EXTENSION_STORE_URL
 *
 * Public listing ID from Chrome Web Store Developer Dashboard.
 */
const DEFAULT_CHROME_EXTENSION_STORE_URL =
  "https://chromewebstore.google.com/detail/blnamggnpkfcfennippabkoafllecghc";

export const CHROME_EXTENSION_STORE_URL =
  process.env.NEXT_PUBLIC_CHROME_EXTENSION_STORE_URL?.trim() ||
  DEFAULT_CHROME_EXTENSION_STORE_URL;

export const CHROME_EXTENSION_PAGE_PATH = "/chrome-extension";

/** True when we have a real /detail/ listing URL (not a search fallback). */
export function hasChromeWebStoreDetailUrl(): boolean {
  return /chromewebstore\.google\.com\/detail\//i.test(CHROME_EXTENSION_STORE_URL);
}

export function chromeExtensionInstallHref(): string {
  return CHROME_EXTENSION_STORE_URL;
}

export function chromeExtensionReviewHref(): string {
  return CHROME_EXTENSION_STORE_URL;
}

/** @deprecated use hasChromeWebStoreDetailUrl — store is live; always link out */
export function hasChromeWebStoreListing(): boolean {
  return Boolean(CHROME_EXTENSION_STORE_URL);
}
