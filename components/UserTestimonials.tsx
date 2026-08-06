import Link from "next/link";

const TESTIMONIALS = [
  {
    id: "assaf",
    label: "Independent feedback",
    quote:
      "Focused single-purpose tool with a compelling privacy differentiator.",
    name: "Assaf Sheinrok",
    role: "Founder of PagePulse",
    href: "https://pagepulse.page",
    hrefLabel: "PagePulse",
  },
  {
    id: "ivan",
    label: "Founder feedback",
    quote:
      "I never thought to audit payment costs from a Stripe Balance CSV. The preview made the fee drivers obvious; next month I will test the recommendations around international cards and small-charge drag, then compare the new export.",
    name: "Ivan Chernov",
    role: null,
    href: null,
    hrefLabel: null,
  },
] as const;

export function UserTestimonials() {
  return (
    <section className="bg-white px-4 py-12 scroll-mt-14" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-4xl">
        <h2 id="testimonials-heading" className="sr-only">
          What users said
        </h2>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
          What users said
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 text-left shadow-sm"
            >
              <figcaption className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {item.label}
              </figcaption>
              <blockquote className="mt-2 text-base leading-relaxed text-gray-700">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{item.name}</span>
                {item.role ? `, ${item.role}` : null}
                {item.href && item.hrefLabel ? (
                  <>
                    {" · "}
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {item.hrefLabel}
                    </Link>
                  </>
                ) : null}
              </p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
