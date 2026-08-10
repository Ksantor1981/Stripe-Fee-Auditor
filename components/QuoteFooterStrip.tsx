import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function QuoteFooterStrip() {
  const t = await getTranslations("quotes");

  const quotes = [
    { quote: t("quote1"), name: t("quote1Name"), href: "https://pagepulse.page", linkLabel: t("quote1Link") },
    { quote: t("quote2"), name: t("quote2Name"), href: null as string | null, linkLabel: null },
  ];

  return (
    <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:gap-8">
        {quotes.map((item) => (
          <figure key={item.name} className="flex-1 text-center sm:text-left">
            <blockquote className="text-sm text-gray-600">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-1 text-xs text-gray-600">
              — {item.name}
              {item.href && item.linkLabel ? (
                <>
                  {" · "}
                  <Link href={item.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                    {item.linkLabel}
                  </Link>
                </>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
