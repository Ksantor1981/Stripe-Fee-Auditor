"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    id: "store-csv",
    q: "Do you store my Stripe CSV file?",
    a: (
      <>
        <p>
          No. The file is parsed in your browser session and sent once to our servers for analysis. We store{" "}
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
    a: (
      <p>
        No API connection and no OAuth. You export a CSV from the Stripe Dashboard and upload it here — same data you could open in a spreadsheet, without granting third-party access to your live account.
      </p>
    ),
  },
  {
    id: "who-sees",
    q: "Who can see my report?",
    a: (
      <p>
        Only someone with your private link (including the access token in the URL). Treat it like a password: don&apos;t share it in public channels. Reports expire automatically based on our retention policy (short preview window or longer during beta / after purchase — see Terms).
      </p>
    ),
  },
  {
    id: "accuracy",
    q: "Are the benchmarks and savings numbers guaranteed?",
    a: (
      <p>
        They&apos;re <strong>directional estimates</strong> built from your export using simplified rules (not Stripe&apos;s internal ledger). Use them to spot patterns and questions for your finance team — not as contractual fee quotes.
      </p>
    ),
  },
  {
    id: "worth-12",
    q: "Is the $12 full report worth it after beta?",
    a: (
      <p>
        It depends on your volume. If you process only a few small payments, the preview or a spreadsheet may be enough.
        If you process meaningful monthly volume, have international customers, refunds, or many low-ticket charges, the full report is designed to show the specific rows and actions behind the headline rate.
      </p>
    ),
  },
  {
    id: "excel",
    q: "Can I calculate this myself in Excel?",
    a: (
      <p>
        Yes. The basic blended rate is just total charge fees divided by total charge volume. Fee Auditor is useful when you want the next layer: monthly changes, unusual charges, refund fee leakage, benchmark context, exports, and specific savings opportunities without rebuilding the spreadsheet every time.
      </p>
    ),
  },
];

export function LandingFaq() {
  return (
    <Accordion className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
      {FAQ_ITEMS.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-gray-100">
          <AccordionTrigger className="text-sm font-semibold text-gray-900 py-4 hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-4 space-y-2">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
