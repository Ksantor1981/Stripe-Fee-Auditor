import { buildBreadcrumbListSchema, type BreadcrumbCrumb } from "@/lib/breadcrumb-schema";

export function BreadcrumbJsonLd({ crumbs }: { crumbs: BreadcrumbCrumb[] }) {
  const data = buildBreadcrumbListSchema(crumbs);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
