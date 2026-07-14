import { absoluteUrl } from "@/lib/site-url";

export type BreadcrumbCrumb = {
  name: string;
  path: string;
};

/** Google-friendly BreadcrumbList JSON-LD (standalone script tag). */
export function buildBreadcrumbListSchema(crumbs: BreadcrumbCrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function blogArticleBreadcrumbs(pageTitle: string, pagePath: string): BreadcrumbCrumb[] {
  return [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: pageTitle, path: pagePath },
  ];
}

export function sitePageBreadcrumbs(pageTitle: string, pagePath: string): BreadcrumbCrumb[] {
  return [
    { name: "Home", path: "/" },
    { name: pageTitle, path: pagePath },
  ];
}
