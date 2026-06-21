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
    <nav aria-label="breadcrumb" className={`text-sm text-gray-500 py-2 ${className}`}>
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mx-2 text-gray-300">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-700 hover:underline transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
