import fs from "fs";
import path from "path";
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

const MESSAGES_ROOT = path.join(process.cwd(), "messages");

function readJsonFile(relativePath: string): JsonObject | null {
  try {
    const full = path.join(MESSAGES_ROOT, relativePath);
    const raw = fs.readFileSync(full, "utf8");
    return JSON.parse(raw) as JsonObject;
  } catch {
    return null;
  }
}

const PARTIALS = ["ui", "report", "legal", "chromeExtension"] as const;

function loadPartial(locale: AppLocale, name: (typeof PARTIALS)[number]): JsonObject {
  const localized = readJsonFile(path.join("partials", locale, `${name}.json`));
  if (localized) return localized;
  if (locale !== defaultLocale) {
    return readJsonFile(path.join("partials", defaultLocale, `${name}.json`)) ?? {};
  }
  return {};
}

function loadPages(locale: AppLocale): JsonObject {
  const en = readJsonFile(path.join("pages", "en.json")) ?? {};
  if (locale === defaultLocale) return en;
  const localized = readJsonFile(path.join("pages", `${locale}.json`));
  return localized ? deepMergeMessages(en, localized) : en;
}

/** Load and merge all next-intl message namespaces for a locale. */
export async function loadMessagesForLocale(locale: AppLocale): Promise<JsonObject> {
  const core = readJsonFile(`${locale}.json`) ?? {};
  const partials = PARTIALS.map((name) => loadPartial(locale, name));
  const pages = loadPages(locale);
  return deepMergeMessages(core, ...partials, pages);
}
