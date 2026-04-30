"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const STEPS = [
  {
    num: "1",
    title: "Open Stripe Dashboard → Reports",
    body: 'In the left sidebar click Reporting → Reports. You\'ll see Balance summary, All fees, and Payout reconciliation.',
    hint: "Make sure you have access to Reporting — Owners and Admins can see this.",
    screenshot: "/screenshots/stripe-step1-reports.png",
    screenshotAlt: "Stripe Dashboard Reports page showing Balance summary, All fees, and Payout reconciliation",
    screenshotH: 420,
  },
  {
    num: "2",
    title: 'Click "Balance summary" → set date range → Export',
    body: 'Under Track money movement click Balance summary. Set your date range (last 3–12 months recommended), then click Export in the top right.',
    hint: 'URL looks like: dashboard.stripe.com/reports/balance_summary',
    screenshot: "/screenshots/stripe-step2-balance.png",
    screenshotAlt: "Stripe Balance summary report with Export button in top right corner",
    screenshotH: 380,
  },
  {
    num: "3",
    title: 'Click "Download to system" → Save CSV',
    body: 'In the Export dropdown select Download to system. The file downloads as a CSV named something like balance_YYYY-MM-DD.csv.',
    hint: "Choose 'Download to system' — not 'Export to warehouse'.",
    screenshot: "/screenshots/stripe-step3-export.png",
    screenshotAlt: "Stripe Export dropdown showing Download to system option highlighted",
    screenshotH: 340,
  },
];

interface Props {
  onReady: () => void;
}

export function ExportInstructions({ onReady }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setReady(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Step 1 of 2</p>
        <h1 className="text-2xl font-bold text-gray-900">Export your Balance CSV</h1>
        <p className="mt-2 text-gray-500 text-sm">
          Stripe keeps a detailed record of every transaction fee. Follow the steps below to export it.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map(({ num, title, body, hint, screenshot, screenshotAlt, screenshotH }) => (
          <div key={num} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white mt-0.5">
              {num}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{body}</p>
              {/* Screenshot */}
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

      {/* Accordion FAQ */}
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
            Make sure you downloaded from <strong>Reports → Balance summary</strong>, not Payments or Payouts.
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
            For trend analysis, export at least 2–3 months. For the best anomaly detection, 6–12 months
            gives more reliable statistics. There&apos;s no upper limit — the tool handles large files.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* CTA — appears after 5 sec */}
      <div className="text-center">
        {ready ? (
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={onReady}
          >
            I have my CSV →
          </Button>
        ) : (
          <p className="text-sm text-gray-400">
            Button appears in{" "}
            <span className="font-semibold tabular-nums text-gray-600">{secondsLeft}s</span>
            {" "}— read the steps above first
          </p>
        )}
      </div>
    </div>
  );
}
