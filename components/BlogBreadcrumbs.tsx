import { blogArticleBreadcrumbs } from "@/lib/breadcrumb-schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";

type BlogBreadcrumbsProps = {
  title: string;
  path: string;
  className?: string;
};

/** Visible breadcrumb trail for blog articles (JSON-LD is emitted by BlogJsonLd / BreadcrumbJsonLd). */
export function BlogBreadcrumbs({ title, path, className }: BlogBreadcrumbsProps) {
  const crumbs = blogArticleBreadcrumbs(title, path);
  return (
    <Breadcrumbs
      className={className}
      items={crumbs.map((crumb, index) => ({
        label: crumb.name,
        href: index < crumbs.length - 1 ? crumb.path : undefined,
      }))}
    />
  );
}
