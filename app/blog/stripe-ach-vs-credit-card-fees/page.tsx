/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ACH vs Credit Card Fees on Stripe: When ACH Wins | Fee Auditor",
  description:
    "ACH costs 0.8% capped at $5. Credit cards cost 2.9%+. Here's exactly when to offer ACH on Stripe and how much you can save.",
  alternates: { canonical: "/blog/stripe-ach-vs-credit-card-fees" },
  openGraph: {
    title: "ACH vs Credit Card Fees on Stripe: When ACH Wins",
    description: "ACH costs 0.8% capped at $5. Credit cards cost 2.9%+. Here's when to switch.",
    url: "https://feeauditor.com/blog/stripe-ach-vs-credit-card-fees",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          ← Blog
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-gray-400">7 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          ACH vs Credit Card Fees on Stripe: When ACH Wins
        </h1>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          ACH bank transfers cost 0.8% capped at $5. Credit cards cost 2.9% + $0.30 — or more
          with international cards. For the right transaction types, switching to ACH can reduce
          your payment processing costs by 70–90%.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Find your ACH savings opportunity:</strong>{" "}
          <Link href="/analyze" className="underline font-medium">
            Upload your Stripe Balance CSV
          </Link>{" "}
          and see which of your transactions would save money on ACH. Or{" "}
          <Link href="/analyze?sample=1" className="underline font-medium">
            try the sample report
          </Link>
          .
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              The fee comparison
            </h2>
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Method</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Rate</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fixed fee</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { method: "Credit/debit card (domestic)", rate: "2.9%", fixed: "$0.30", cap: "None" },
                    { method: "International card", rate: "4.4%", fixed: "$0.30", cap: "None" },
                    { method: "ACH Direct Debit", rate: "0.8%", fixed: "None", cap: "$5.00" },
                  ].map((r) => (
                    <tr key={r.method} className="bg-white">
                      <td className="px-4 py-3 text-gray-600">{r.method}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{r.rate}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{r.fixed}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{r.cap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              ACH is US-only. Stripe also supports SEPA Direct Debit for Europe (0.8%, capped at €5)
              and BECS for Australia (1.75%, capped at A$3.50).
            </p>
            <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
              <strong>Stripe Billing:</strong> If you use Stripe&apos;s subscription billing product for
              invoicing and recurring logic, plan for about <strong>0.7%</strong> of billing volume on
              top of card or ACH processing — it moves blended rates up for SaaS stacks using that
              engine (verify current Stripe Billing pricing on stripe.com/pricing).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              When ACH is clearly better
            </h2>
            <p>
              The break-even point where ACH and card cost the same is around $175:
            </p>
            <div className="mt-3 rounded-lg bg-gray-900 text-green-400 px-5 py-3 font-mono text-sm">
              ACH fee = min(0.8% × amount, $5 cap). Domestic card = 2.9% × amount + $0.30.
            </div>
            <p className="mt-3">
              Actually the math is simpler: ACH is capped at $5. Any card transaction over $625
              will have fees higher than $5 on a card. Below $625, ACH is still often cheaper
              because of the lower rate — the break-even where card becomes cheaper is at very
              small amounts (below ~$12).
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Fee comparison by transaction size</p>
              <div className="space-y-2 text-sm">
                {[
                  { amount: "$50", card: "$1.75", ach: "$0.40", winner: "ACH" },
                  { amount: "$100", card: "$3.20", ach: "$0.80", winner: "ACH" },
                  { amount: "$500", card: "$14.80", ach: "$4.00", winner: "ACH" },
                  { amount: "$625+", card: "$18.43+", ach: "$5.00", winner: "ACH (capped)" },
                  { amount: "$1,000", card: "$29.30", ach: "$5.00", winner: "ACH (capped)" },
                ].map((r) => (
                  <div key={r.amount} className="flex justify-between items-center text-gray-600">
                    <span className="font-mono w-16">{r.amount}</span>
                    <span className="text-red-500">Card: {r.card}</span>
                    <span className="text-green-600">ACH: {r.ach}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">{r.winner}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              The right use cases for ACH
            </h2>
            <ul className="space-y-4 list-none">
              {[
                {
                  title: "B2B invoices over $500",
                  desc: "This is the clearest win. A $2,000 invoice on a card costs $58.30. On ACH it costs $5.00. That's $53 saved on a single payment — and US businesses are generally comfortable with bank transfers for invoices.",
                },
                {
                  title: "Annual subscription plans",
                  desc: "If you offer annual billing, the lump-sum payment is often $500–$5,000. Offering ACH as a payment option for annual plans can meaningfully reduce your effective fee rate with minimal customer friction.",
                },
                {
                  title: "High-volume SaaS with US business customers",
                  desc: "B2B SaaS targeting US businesses is the sweet spot for ACH. Finance teams often prefer bank transfers anyway, and the savings per transaction are significant at enterprise price points.",
                },
              ].map((item) => (
                <li key={item.title} className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              The downsides of ACH
            </h2>
            <p>ACH isn't always the right choice. The main limitations:</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                "ACH payments take 3–5 business days to settle, vs instant for cards",
                "ACH failure rate is higher — customers can dispute charges up to 60 days later",
                "Not available outside the US (use SEPA for Europe, BECS for Australia)",
                "Customers may need to find their routing and account number, adding friction",
                "Not appropriate for one-time consumer purchases where card is expected",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-orange-400">⚠</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How to enable ACH on Stripe
            </h2>
            <p>
              ACH Direct Debit is available on all Stripe accounts. To enable it:
            </p>
            <ol className="mt-3 space-y-2 text-sm list-none">
              {[
                "Go to Stripe Dashboard → Settings → Payment methods",
                'Find "ACH Direct Debit" and enable it',
                "When creating a PaymentIntent or Checkout Session, include 'us_bank_account' in the payment_method_types array",
                "For recurring billing, use Stripe's SetupIntent flow to collect and verify the bank account once, then charge it going forward",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How to find which of your transactions should be ACH
            </h2>
            <p>
              Look at your Stripe Balance CSV for large card transactions — specifically charges
              over $200 from US business customers. These are your best ACH candidates.
            </p>
            <p className="mt-3">
              feeauditor.com automatically identifies transactions where ACH would have been
              significantly cheaper and calculates your estimated annual savings from switching
              those specific transactions to ACH. This gives you a concrete dollar figure to
              justify the implementation effort.
            </p>
          </section>

        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <p className="font-semibold text-gray-900">Find your ACH savings opportunity</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload your Stripe Balance CSV to feeauditor.com. You'll see which transactions would
            have been cheaper on ACH, and your estimated annual savings from switching.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/analyze"
              className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors text-center"
            >
              Analyze My Fees
            </Link>
            <Link
              href="/analyze?sample=1"
              className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Try sample report →
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Related articles</p>
          <div className="space-y-3">
            {[
              { href: "/blog/why-stripe-effective-rate-higher-than-2-9-percent", title: "Why Is My Stripe Effective Rate Higher Than 2.9%?" },
              { href: "/blog/stripe-international-card-fees", title: "Stripe International Card Fees Explained" },
              { href: "/blog/how-to-reduce-stripe-fees", title: "How to Reduce Your Stripe Fees" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block text-sm text-blue-600 hover:underline">
                {l.title} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
