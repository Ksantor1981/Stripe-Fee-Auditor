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

/** Export guide below the upload zone — collapsed by default so cold traffic isn't scared away. */
export function ExportInstructions() {
  return (
    <div id="export-steps" className="scroll-mt-6 space-y-4">
      <details className="group rounded-xl border border-gray-200 bg-white shadow-sm open:shadow-md">
        <summary className="cursor-pointer list-none px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Optional · when you have Stripe access
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">
                How to export your Balance CSV
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Open this only after the sample — or if you already know you want your own file.
                Path: Reports → Balance summary → Export → Itemized.
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-blue-600 group-open:hidden">
              Show steps
            </span>
            <span className="hidden shrink-0 text-sm font-medium text-blue-600 group-open:inline">
              Hide
            </span>
          </div>
        </summary>

        <div className="space-y-4 border-t border-gray-100 px-5 py-5">
          <div className="flex flex-wrap gap-3">
            <a
              href="#upload-csv"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={() =>
                trackEvent("funnel_export_instructions_done", { placement: "scroll_to_upload" })
              }
            >
              Jump to upload ↑
            </a>
            <a
              href="/analyze?sample=1"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              onClick={() => trackEvent("funnel_sample_cta", { placement: "export_instructions" })}
            >
              Try sample instead
            </a>
          </div>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Works best with single-currency <strong>USD</strong> Stripe accounts right now.
            Multi-currency support is coming.
          </p>

          <div className="space-y-4">
            {STEPS.map(({ num, title, body, hint, screenshot, screenshotAlt, screenshotH }) => (
              <div
                key={num}
                className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {num}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500">{body}</p>
                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={screenshot}
                      alt={screenshotAlt}
                      width={800}
                      height={screenshotH}
                      className="h-auto w-full"
                    />
                  </div>
                  <p className="mt-2 text-xs italic text-gray-400">💡 {hint}</p>
                </div>
              </div>
            ))}
          </div>

          <Accordion className="rounded-xl border border-gray-100 bg-white px-4 shadow-sm">
            <AccordionItem value="no-balance">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                I don&apos;t see a Balance report
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4 text-sm text-gray-500">
                <p>
                  The Balance report is available to <strong>Owners and Administrators</strong>. If
                  you don&apos;t see it, ask your account admin to export it, or check your
                  permission level in Settings → Team.
                </p>
                <p>
                  If your account is on <strong>Stripe Connect</strong>, you may need to export from
                  the platform account rather than a connected account.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wrong-file">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                What if I downloaded the wrong file?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-gray-500">
                Make sure you used{" "}
                <strong>Reports → Balance summary → Export → Itemized → Download to system</strong>,
                not Payments or Payouts-only exports. The correct file has columns like{" "}
                <code className="rounded bg-gray-100 px-1">id</code>,{" "}
                <code className="rounded bg-gray-100 px-1">type</code>,{" "}
                <code className="rounded bg-gray-100 px-1">amount</code>,{" "}
                <code className="rounded bg-gray-100 px-1">fee</code>.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-much-data" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                How much data should I export?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-gray-500">
                For trend analysis, export at least 2–3 months. For better high-fee charge detection,
                6–12 months helps. Upload size is limited to about <strong>4 MB</strong> per file.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </details>
    </div>
  );
}
