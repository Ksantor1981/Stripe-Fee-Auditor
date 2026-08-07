import Link from "next/link";

export type SeoRelatedLink = {
  context: string;
  href: string;
  label: string;
};

type Props = {
  title?: string;
  links: SeoRelatedLink[];
  className?: string;
};

/** Context + link rows — same pattern on money-intent SEO landings. */
export function SeoRelatedReading({
  title = "Related reading",
  links,
  className = "",
}: Props) {
  return (
    <div className={`mt-8 pt-8 border-t border-gray-100 space-y-4 ${className}`}>
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {links.map((item) => (
        <div
          key={item.href}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400"
        >
          <span>{item.context}</span>
          <Link
            href={item.href}
            className="text-blue-600 hover:text-blue-700 font-medium shrink-0"
          >
            {item.label} →
          </Link>
        </div>
      ))}
    </div>
  );
}
