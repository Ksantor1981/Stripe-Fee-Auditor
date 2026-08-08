import Link from "next/link";

const QUOTES = [
  {
    quote: "Focused single-purpose tool with a compelling privacy differentiator.",
    name: "Assaf Sheinrok",
    href: "https://pagepulse.page",
  },
  {
    quote: "The preview made the fee drivers obvious.",
    name: "Ivan Chernov",
    href: null,
  },
] as const;

/** Compact social proof — lives in footer, not a full page section. */
export function QuoteFooterStrip() {
  return (
    <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:gap-8">
        {QUOTES.map((item) => (
          <figure key={item.name} className="flex-1 text-center sm:text-left">
            <blockquote className="text-sm text-gray-600">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-1 text-xs text-gray-600">
              — {item.name}
              {item.href ? (
                <>
                  {" · "}
                  <Link href={item.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                    PagePulse
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
