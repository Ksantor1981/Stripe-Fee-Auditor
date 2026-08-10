import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BlogBreadcrumbs } from "@/components/BlogBreadcrumbs";
import { BlogFaqSection, BlogJsonLd, BlogSourcesSection } from "@/components/BlogSeoBlocks";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { SeoAnalyzeCta } from "@/components/SeoAnalyzeCta";
import { renderInlineLinks, blogReadTimeLabel } from "@/lib/i18n/page-helpers";

type Section = Record<string, unknown>;
type FaqItem = { question: string; answer: string };
type SourceItem = { href: string; title: string };
type RelatedItem = { href: string; title: string };
type TableData = { headers: string[]; rows: string[][] };

import type { PageContentNamespace } from "@/lib/i18n/blog-slug-map";

type Props = {
  contentKey: string;
  path: string;
  namespace?: PageContentNamespace;
};

function BlogTable({ table }: { table: TableData }) {
  return (
    <div className="not-prose overflow-hidden rounded-xl border border-gray-200 text-sm">
      <div
        className="grid border-b border-gray-200 bg-gray-50 font-semibold text-gray-700"
        style={{ gridTemplateColumns: `repeat(${table.headers.length}, minmax(0, 1fr))` }}
      >
        {table.headers.map((h) => (
          <div key={h} className="px-3 py-2.5">
            {h}
          </div>
        ))}
      </div>
      {table.rows.map((row) => (
        <div
          key={row.join("|")}
          className="grid border-b border-gray-100 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${table.headers.length}, minmax(0, 1fr))` }}
        >
          {row.map((cell, ci) => (
            <div key={`${ci}-${cell.slice(0, 20)}`} className="border-l border-gray-100 px-3 py-2.5 first:border-l-0 text-gray-600">
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BlogSectionTable({ table }: { table: TableData }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {table.headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {table.rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="px-4 py-3 align-top text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlogSections({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const type = String(section.type ?? "section");
        if (type === "callout") {
          return (
            <div key={index} className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
              {section.title ? <h2 className="text-base font-bold text-blue-950">{String(section.title)}</h2> : null}
              <p className="mt-2">{renderInlineLinks(String(section.body ?? ""))}</p>
            </div>
          );
        }
        if (type === "cta") {
          return (
            <div key={index} className="not-prose my-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-5 text-center">
              {section.title ? <p className="text-sm font-semibold text-gray-900">{String(section.title)}</p> : null}
              {section.body ? <p className="mt-2 text-sm text-gray-600">{renderInlineLinks(String(section.body))}</p> : null}
              <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                {section.sampleHref ? (
                  <Link
                    href={String(section.sampleHref)}
                    className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {String(section.sampleLabel ?? "Try sample →")}
                  </Link>
                ) : null}
                {section.primaryHref ? (
                  <Link
                    href={String(section.primaryHref)}
                    className="inline-flex rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    {String(section.primaryLabel ?? "Upload CSV →")}
                  </Link>
                ) : null}
              </div>
            </div>
          );
        }
        if (type === "section") {
          const table = section.table as TableData | undefined;
          return (
            <div key={index}>
              {section.heading ? <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">{String(section.heading)}</h2> : null}
              {(section.paragraphs as string[] | undefined)?.map((p) => (
                <p key={p.slice(0, 48)} className="text-gray-700 leading-relaxed mb-3">
                  {renderInlineLinks(p)}
                </p>
              ))}
              {(section.bullets as string[] | undefined)?.length ? (
                <ul className="mt-4 space-y-2">
                  {(section.bullets as string[]).map((b) => (
                    <li key={b.slice(0, 48)} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{renderInlineLinks(b)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {table ? <BlogSectionTable table={table} /> : null}
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

export async function BlogArticleContent({ contentKey, path, namespace = "blog" }: Props) {
  const t = await getTranslations(`${namespace}.${contentKey}`);
  const intro = (t.raw("intro") as string[] | undefined) ?? [];
  const sections = (t.raw("sections") as Section[] | undefined) ?? [];
  const faq = (t.raw("faq") as FaqItem[] | undefined) ?? [];
  const sources = (t.raw("sources") as SourceItem[] | undefined) ?? [];
  const related = (t.raw("related") as RelatedItem[] | undefined) ?? [];
  const table = t.raw("table") as TableData | undefined;
  const readTimeLabel = await blogReadTimeLabel(contentKey, namespace);

  const title = t("title");
  const breadcrumbTitle = t.has("shortTitle") ? t("shortTitle") : title;
  const description = t("metaDescription");
  const published = t.has("publishedAt") ? t("publishedAt") : "2026-05-16";
  const updated = t.has("updatedAt") ? t("updatedAt") : published;

  return (
    <>
      <BlogJsonLd
        title={title}
        description={description}
        path={path}
        published={published}
        updated={updated}
        faqs={faq.map((f) => ({ question: f.question, answer: f.answer }))}
      />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <BlogBreadcrumbs title={breadcrumbTitle} path={path} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
        <p className="mt-3 text-sm text-gray-500">{readTimeLabel}</p>

        <div className="prose prose-gray mt-8 max-w-none space-y-5 text-base leading-relaxed text-gray-700">
          {intro.map((p) => (
            <p key={p.slice(0, 48)}>{renderInlineLinks(p)}</p>
          ))}
          {table ? <BlogTable table={table} /> : null}
          <BlogSections sections={sections} />
        </div>

        <div className="mt-10">
          <BlogBetaRetentionNote />
        </div>
        {faq.length > 0 ? <BlogFaqSection items={faq} /> : null}
        {related.length > 0 ? (
          <section className="mt-10 border-t border-gray-100 pt-8">
            <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
            <div className="mt-4 space-y-3">
              {related.map((link) => (
                <Link key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                  {link.title} →
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        {sources.length > 0 ? <BlogSourcesSection items={sources} /> : null}
        <SeoAnalyzeCta className="mt-10" />
      </div>
    </>
  );
}
