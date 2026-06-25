import { absoluteUrl } from "@/lib/site-url";

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type BlogSourceItem = {
  href: string;
  title: string;
};

type BlogJsonLdProps = {
  title: string;
  description: string;
  path: string;
  published: string;
  updated?: string;
  faqs?: BlogFaqItem[];
};

export function BlogJsonLd({ title, description, path, published, updated = published, faqs = [] }: BlogJsonLdProps) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: published,
    dateModified: updated,
    author: { "@type": "Person", name: "Konstantin Starkov" },
    publisher: { "@type": "Organization", name: "Stripe Fee Auditor", url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(path),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: title, item: absoluteUrl(path) },
    ],
  };

  const faq =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const structuredData = faq ? [article, breadcrumbs, faq] : [article, breadcrumbs];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
    />
  );
}

export function BlogFaqSection({ items }: { items: BlogFaqItem[] }) {
  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold text-gray-900">Common questions</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.question} className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">{item.question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BlogFaqJsonLd({ items }: { items: BlogFaqItem[] }) {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faq).replace(/</g, "\\u003c") }}
    />
  );
}

export function BlogSourcesSection({ items }: { items: BlogSourceItem[] }) {
  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-sm font-semibold text-gray-700">Official sources</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        Pricing and payment rules can change. Use official docs as the current reference, then compare them with your own Stripe export.
      </p>
      <div className="mt-4 space-y-2">
        {items.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            {source.title} -&gt;
          </a>
        ))}
      </div>
    </section>
  );
}
