import { getLocale } from "next-intl/server";
import { defaultLocale, type AppLocale } from "@/i18n/config";

type JsonObject = Record<string, unknown>;

async function importPageMessages(locale: AppLocale): Promise<JsonObject | null> {
  try {
    const mod = await import(`../../messages/pages/${locale}.json`);
    return (mod.default ?? mod) as JsonObject;
  } catch {
    return null;
  }
}

/** Load a nested page copy object from messages/pages/{locale}.json with English fallback. */
export async function getPageContent<T extends JsonObject>(
  path: string
): Promise<T> {
  const locale = (await getLocale()) as AppLocale;
  const localized = await importPageMessages(locale);
  const fallback = locale === defaultLocale ? null : await importPageMessages(defaultLocale);

  const fromLocalized = getNested(localized, path);
  if (fromLocalized) return fromLocalized as T;

  const fromFallback = getNested(fallback, path);
  if (fromFallback) return fromFallback as T;

  throw new Error(`Missing page content: ${path} (${locale})`);
}

function getNested(root: JsonObject | null, dotPath: string): JsonObject | null {
  if (!root) return null;
  let current: unknown = root;
  for (const part of dotPath.split(".")) {
    if (!current || typeof current !== "object" || !(part in (current as JsonObject))) {
      return null;
    }
    current = (current as JsonObject)[part];
  }
  return current && typeof current === "object" ? (current as JsonObject) : null;
}

/** Safe variant — returns null instead of throwing (for optional blocks). */
export async function tryGetPageContent<T extends JsonObject>(
  path: string
): Promise<T | null> {
  try {
    return await getPageContent<T>(path);
  } catch {
    return null;
  }
}
