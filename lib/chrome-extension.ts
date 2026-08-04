/**
 * Chrome helper install / review links.
 * Set NEXT_PUBLIC_CHROME_EXTENSION_STORE_URL to the live Web Store detail URL
 * (https://chromewebstore.google.com/detail/...). Until then, CTAs use /chrome-extension.
 */
export const CHROME_EXTENSION_STORE_URL =
  process.env.NEXT_PUBLIC_CHROME_EXTENSION_STORE_URL?.trim() || "";

export const CHROME_EXTENSION_PAGE_PATH = "/chrome-extension";

export function chromeExtensionInstallHref(): string {
  return CHROME_EXTENSION_STORE_URL || CHROME_EXTENSION_PAGE_PATH;
}

export function chromeExtensionReviewHref(): string {
  return CHROME_EXTENSION_STORE_URL || CHROME_EXTENSION_PAGE_PATH;
}

export function hasChromeWebStoreListing(): boolean {
  return Boolean(CHROME_EXTENSION_STORE_URL);
}
