import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";

interface Props {
  title?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
}

export function BlogArticleCta({
  title = "See your real Stripe fee rate from your CSV",
  body = "Upload a Stripe Balance Transactions export — no OAuth, no account. Get processing vs all-in rate, benchmark context, and fee drivers.",
  primaryHref = "/analyze",
  primaryLabel = "Analyze My Fees",
}: Props) {
  return (
    <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600 leading-relaxed">{body}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {primaryLabel}
        </Link>
        <Link
          href="/analyze?sample=1"
          className="inline-flex justify-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View sample report →
        </Link>
      </div>
      <BlogBetaRetentionNote tone="gray" />
    </section>
  );
}
