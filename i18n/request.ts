import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  isAppLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  type AppLocale,
} from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: AppLocale = defaultLocale;
  if (isAppLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const headerStore = await headers();
    const detected = localeFromAcceptLanguage(headerStore.get("accept-language"));
    if (detected) locale = detected;
  }

  const { loadMessagesForLocale } = await import("../lib/i18n/load-messages");

  return {
    locale,
    messages: await loadMessagesForLocale(locale),
  };
});
