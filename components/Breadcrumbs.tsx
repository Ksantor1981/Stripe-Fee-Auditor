import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-gray-500 py-2 ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 list-none p-0 m-0">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
            {i > 0 && <span className="text-gray-300" aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-gray-700 hover:underline transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
