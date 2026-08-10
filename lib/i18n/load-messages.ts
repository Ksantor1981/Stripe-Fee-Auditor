import { defaultLocale, type AppLocale } from "@/i18n/config";

type JsonObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merge message trees; later objects win on leaf conflicts. */
export function deepMergeMessages(...parts: JsonObject[]): JsonObject {
  const result: JsonObject = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      const existing = result[key];
      if (isPlainObject(existing) && isPlainObject(value)) {
        result[key] = deepMergeMessages(existing, value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

async function importJson(path: string): Promise<JsonObject | null> {
  try {
    const mod = await import(path);
    return (mod.default ?? mod) as JsonObject;
  } catch {
    return null;
  }
}

const PARTIALS = ["ui", "report", "legal", "chromeExtension"] as const;

async function loadPartial(locale: AppLocale, name: (typeof PARTIALS)[number]): Promise<JsonObject> {
  const localized =
    (await importJson(`../../messages/partials/${locale}/${name}.json`)) ??
    (locale === defaultLocale ? null : await importJson(`../../messages/partials/${defaultLocale}/${name}.json`));
  return localized ?? {};
}

async function loadPages(locale: AppLocale): Promise<JsonObject> {
  const en = (await importJson(`../../messages/pages/en.json`)) ?? {};
  if (locale === defaultLocale) return en;
  const localized = await importJson(`../../messages/pages/${locale}.json`);
  return localized ? deepMergeMessages(en, localized) : en;
}

/** Load and merge all next-intl message namespaces for a locale. */
export async function loadMessagesForLocale(locale: AppLocale): Promise<JsonObject> {
  const core = (await importJson(`../../messages/${locale}.json`)) ?? {};
  const partials = await Promise.all(PARTIALS.map((name) => loadPartial(locale, name)));
  const pages = await loadPages(locale);
  return deepMergeMessages(core, ...partials, pages);
}
