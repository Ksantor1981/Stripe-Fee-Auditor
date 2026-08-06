"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const LANDING_FAQ_ITEMS = [
  {
    id: "useful-for-me",
    q: "Is Fee Auditor useful for my business?",
    text: [
      "Useful if you have international cards, refunds, small subscriptions, or a Stripe rate that feels higher than expected. Skip if you only have a few domestic high-ticket charges and just need a rough spreadsheet formula.",
    ],
    a: (
      <p>
        Useful if you have international cards, refunds, small subscriptions, or a Stripe rate that feels higher than expected.
        Skip if you only have a few domestic high-ticket charges and just need a rough spreadsheet formula.
      </p>
    ),
  },
  {
    id: "store-csv",
    q: "Do you store my Stripe CSV file?",
    text: [
      "No. Your browser reads the file for upload preview, then sends it once to our servers for analysis. We store computed numbers and aggregates (rates, totals, grouped categories) — not the raw CSV as a file.",
      "Transaction IDs may appear in your private report so you can match rows to Stripe; free-text descriptions from the export are stripped before long-term storage where possible.",
    ],
    a: (
      <>
        <p>
          No. Your browser reads the file for upload preview, then sends it once to our servers for analysis. We store{" "}
          <strong>computed numbers and aggregates</strong> (rates, totals, grouped categories) — not the raw CSV as a file.
        </p>
        <p className="mt-2">
          Transaction IDs may appear in your private report so you can match rows to Stripe; free-text descriptions from the export are stripped before long-term storage where possible.
        </p>
      </>
    ),
  },
  {
    id: "stripe-access",
    q: "Does Stripe Fee Auditor connect to my Stripe account?",
    text: [
      "No API connection and no OAuth. You export a CSV from the Stripe Dashboard and upload it here — same data you could open in a spreadsheet, without granting third-party access to your live account.",
    ],
    a: (
      <p>
        No API connection and no OAuth. You export a CSV from the Stripe Dashboard and upload it here — same data you could open in a spreadsheet, without granting third-party access to your live account.
      </p>
    ),
  },
  {
    id: "who-sees",
    q: "Who can see my report?",
    text: [
      "Only someone with your private link (including the access token in the URL). Treat it like a password: don't share it in public channels. Reports expire automatically based on our retention policy (short preview window or longer during beta / after purchase — see Terms).",
    ],
    a: (
      <p>
        Only someone with your private link (including the access token in the URL). Treat it like a password: don&apos;t share it in public channels. Reports expire automatically based on our retention policy (short preview window or longer during beta / after purchase — see Terms).
      </p>
    ),
  },
  {
    id: "accuracy",
    q: "Are the benchmarks and savings numbers guaranteed?",
    text: [
      "They're directional estimates built from your export using simplified rules (not Stripe's internal ledger). Use them to spot patterns and questions for your finance team — not as contractual fee quotes.",
    ],
    a: (
      <p>
        They&apos;re <strong>directional estimates</strong> built from your export using simplified rules (not Stripe&apos;s internal ledger). Use them to spot patterns and questions for your finance team — not as contractual fee quotes.
      </p>
    ),
  },
  {
    id: "worth-12",
    q: "Is the $12 full report worth it after beta?",
    text: [
      "It depends on your volume. If you process only a few small payments, the preview or a spreadsheet may be enough. If you process meaningful monthly volume, have international customers, refunds, or many low-ticket charges, the full report is designed to show the specific rows and actions behind the headline rate.",
    ],
    a: (
      <p>
        It depends on your volume. If you process only a few small payments, the preview or a spreadsheet may be enough.
        If you process meaningful monthly volume, have international customers, refunds, or many low-ticket charges, the full report is designed to show the specific rows and actions behind the headline rate.
      </p>
    ),
  },
  {
    id: "stripe-refund-policy",
    q: "Does Stripe return fees when I refund a payment?",
    text: [
      "No. Per Stripe's pricing FAQ, when you issue a refund Stripe does not return the processing fees, Connect fees, or currency conversion fees from the original transaction. That can raise your blended effective rate if refunds are common.",
    ],
    a: (
      <p>
        No. Per{" "}
        <a
          href="https://stripe.com/pricing"
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe&apos;s pricing FAQ
        </a>
        , when you issue a refund Stripe does <strong>not</strong> return the processing fees, Connect fees, or
        currency conversion fees from the original transaction. That can raise your blended effective rate if
        refunds are common.
      </p>
    ),
  },
  {
    id: "stripe-disputes",
    q: "What do Stripe disputes and Smart Disputes cost?",
    text: [
      "Stripe charges a $15 fee when a dispute is received; that fee is refunded if you win the dispute. Smart Disputes (when enabled) adds 30% of the disputed amount when you win — on top of card processing fees.",
    ],
    a: (
      <p>
        Stripe charges a <strong>$15</strong> fee when a dispute is received; that fee is refunded if you win the
        dispute. <strong>Smart Disputes</strong> (when enabled) adds <strong>30% of the disputed amount</strong> when
        you win — on top of card processing fees. See{" "}
        <a
          href="https://stripe.com/pricing"
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          stripe.com/pricing
        </a>
        .
      </p>
    ),
  },
  {
    id: "stripe-billing-fees",
    q: "Does Stripe Billing add fees on top of card processing?",
    text: [
      "Yes. Stripe Billing is 0.7% of billing volume (subscriptions, invoices, usage-based billing) on top of standard card processing fees. Tax, Radar, BNPL, and other products have separate published rates.",
    ],
    a: (
      <p>
        Yes.{" "}
        <a
          href="https://stripe.com/billing/pricing"
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe Billing
        </a>{" "}
        is <strong>0.7%</strong> of billing volume (subscriptions, invoices, usage-based billing) on top of standard
        card processing fees. Tax, Radar, BNPL, and other products have separate published rates.
      </p>
    ),
  },
  {
    id: "stripe-custom-pricing",
    q: "Why might my Stripe rate differ from published pricing?",
    text: [
      "Many accounts have custom or interchange-plus pricing. Regional card mix, manually entered cards (+0.5%), and product add-ons also change the blended rate. Check Dashboard → Settings → Plans and fees for your contract rates.",
    ],
    a: (
      <p>
        Many accounts have <strong>custom or interchange-plus pricing</strong>. Regional card mix, manually entered
        cards (+0.5%), and product add-ons also change the blended rate. Check{" "}
        <strong>Dashboard → Settings → Plans and fees</strong> for your contract rates — our calculator and benchmarks
        use published list pricing unless noted.
      </p>
    ),
  },
  {
    id: "stripe-regional-rates",
    q: "Do Stripe fees differ by country?",
    text: [
      "Yes. Domestic and international card rates vary by account country (US, UK, EU, CA, AU, etc.). UK and EU use tiered cross-border uplifts; Canada international cards add 0.8%; Australia domestic is 1.7% + A$0.30 with lower pricing from 1 Oct 2026.",
    ],
    a: (
      <p>
        Yes. Domestic and international card rates vary by account country (US, UK, EU, CA, AU, etc.). UK and EU use
        tiered cross-border uplifts; Canada international cards add <strong>0.8%</strong>; Australia domestic is{" "}
        <strong>1.7% + A$0.30</strong> with lower pricing from <strong>1 Oct 2026</strong>. Our fee estimator lets you
        pick a region; exact tiers are on{" "}
        <a
          href="https://stripe.com/pricing"
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          stripe.com/pricing
        </a>
        .
      </p>
    ),
  },
  {
    id: "chatgpt",
    q: "Can I just paste my Stripe CSV into ChatGPT?",
    text: [
      "ChatGPT can discuss a few rows, but it will not reliably compute your all-in rate across thousands of transactions, flag high-fee charges with row-level evidence, or return the same ranked savings actions every time.",
      "Fee Auditor runs deterministic rules on the full export — no hallucinated fees, with action labels and Stripe dashboard links where applicable.",
    ],
    a: (
      <>
        <p>
          ChatGPT can discuss a few rows, but it will not reliably compute your all-in rate across thousands of
          transactions, flag high-fee charges with row-level evidence, or return the same ranked savings actions every time.
        </p>
        <p className="mt-2">
          Fee Auditor runs <strong>deterministic rules</strong> on the full export — no hallucinated fees — with ranked
          savings opportunities and Stripe dashboard links where applicable.
        </p>
      </>
    ),
  },
  {
    id: "excel",
    q: "Can I calculate this myself in Excel?",
    text: [
      "Yes. The basic blended rate is just total charge fees divided by total charge volume. Fee Auditor is useful when you want the next layer: monthly changes, high-fee charges, refund fee leakage, benchmark context, exports, and specific savings opportunities without rebuilding the spreadsheet every time.",
    ],
    a: (
      <p>
        Yes. The basic blended rate is just total charge fees divided by total charge volume. Fee Auditor is useful when you want the next layer: monthly changes, high-fee charges, refund fee leakage, benchmark context, exports, and specific savings opportunities without rebuilding the spreadsheet every time.
      </p>
    ),
  },
];

/** Top trust questions on `/` only — rest live on `/how-it-works`. */
export const LANDING_FAQ_HOME_IDS = ["store-csv", "stripe-access", "useful-for-me"] as const;

/** FAQ items shown on `/how-it-works` (everything except the 3 on home). */
export const LANDING_FAQ_EXTENDED_IDS = LANDING_FAQ_ITEMS.filter(
  (item) => !(LANDING_FAQ_HOME_IDS as readonly string[]).includes(item.id)
).map((item) => item.id);

type LandingFaqProps = {
  itemIds?: readonly string[];
};

export function LandingFaq({ itemIds }: LandingFaqProps) {
  const items = itemIds
    ? LANDING_FAQ_ITEMS.filter((item) => itemIds.includes(item.id))
    : LANDING_FAQ_ITEMS;

  return (
    <Accordion className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
          {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-gray-100">
          <AccordionTrigger className="text-sm font-semibold text-gray-900 py-4 hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-base text-gray-600 leading-relaxed pb-4 space-y-2">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
