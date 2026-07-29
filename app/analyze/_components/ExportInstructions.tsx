"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics";

const STEPS = [
  {
    num: "1",
    title: "Stripe Dashboard → Reports → Balance summary",
    body: "In the sidebar, open Reports, then open Balance summary (under balance / money movement — not Payments or Payouts). Some accounts show the section label as “Reporting”; you still want Reports → Balance summary.",
    hint: "Owners and Administrators can export. On Stripe Connect, you may need the platform account.",
    screenshot: "/screenshots/stripe-step1-reports.png",
    screenshotAlt: "Stripe Dashboard Reports area leading to Balance summary",
    screenshotH: 420,
  },
  {
    num: "2",
    title: "Export → Itemized → set date range",
    body: "Click Export (top right). Choose Itemized — not Summary — so each row is one balance transaction with fees. Set your date range (we recommend 3–12 months).",
    hint: "Itemized matches Fee Auditor’s expected columns (id, type, amount, fee, …).",
    screenshot: "/screenshots/stripe-step2-balance.png",
    screenshotAlt: "Balance summary export flow with Itemized selected",
    screenshotH: 380,
  },
  {
    num: "3",
    title: "Download to system → Save CSV",
    body: "Finish the export and choose Download to system. The file saves as a CSV (often named like balance_YYYY-MM-DD.csv).",
    hint: "Choose 'Download to system' — not 'Export to warehouse'.",
    screenshot: "/screenshots/stripe-step3-export.png",
    screenshotAlt: "Stripe Export dropdown showing Download to system option highlighted",
    screenshotH: 340,
  },
];

/** Compact export guide shown above the upload zone (same page — no separate Continue step). */
export function ExportInstructions() {
  return (
    <div id="export-steps" className="space-y-6 scroll-mt-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
          Export guide
        </p>
        <h2 className="text-xl font-bold text-gray-900">How to get your Balance CSV</h2>
        <p className="mt-2 text-gray-500 text-sm">
          Already have the file? Scroll to upload below. Need it? Follow the steps, then drop the CSV
          on the same page.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="#upload-csv"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => trackEvent("funnel_export_instructions_done", { placement: "scroll_to_upload" })}
          >
            Jump to upload ↓
          </a>
          <a
            href="/analyze?sample=1"
            className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            onClick={() => trackEvent("funnel_sample_cta", { placement: "export_instructions" })}
          >
            Try sample in 10s
          </a>
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>USD accounts:</strong> This tool works best with single-currency USD Stripe accounts.
          Multi-currency support is coming soon.
        </div>
      </div>

      <div className="space-y-4">
        {STEPS.map(({ num, title, body, hint, screenshot, screenshotAlt, screenshotH }) => (
          <div key={num} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white mt-0.5">
              {num}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{body}</p>
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={screenshot}
                  alt={screenshotAlt}
                  width={800}
                  height={screenshotH}
                  className="w-full h-auto"
                  priority={num === "1"}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400 italic">💡 {hint}</p>
            </div>
          </div>
        ))}
      </div>

      <Accordion className="bg-white rounded-xl border border-gray-100 shadow-sm px-4">
        <AccordionItem value="no-balance">
          <AccordionTrigger className="text-sm font-medium text-gray-700">
            I don&apos;t see a Balance report
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-500 space-y-2 pb-4">
            <p>
              The Balance report is available to <strong>Owners and Administrators</strong>. If you don&apos;t see it,
              ask your account admin to export it, or check your permission level in Settings → Team.
            </p>
            <p>
              If your account is on <strong>Stripe Connect</strong>, you may need to export from the platform account
              rather than a connected account.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="wrong-file">
          <AccordionTrigger className="text-sm font-medium text-gray-700">
            What if I downloaded the wrong file?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-500 pb-4">
            Make sure you used <strong>Reports → Balance summary → Export → Itemized → Download to system</strong>, not Payments or Payouts-only exports.
            The correct file has columns like <code className="bg-gray-100 px-1 rounded">id</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">type</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">amount</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">fee</code>.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-much-data" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-gray-700">
            How much data should I export?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-500 pb-4">
            For trend analysis, export at least 2–3 months. For the best high-fee charge detection, 6–12 months
            gives more reliable statistics. Upload size is limited to about <strong>4 MB</strong> per file (hosting limit).
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
