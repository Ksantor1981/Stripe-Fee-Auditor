"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    num: "1",
    title: "Open Stripe Dashboard",
    body: 'Go to dashboard.stripe.com and log in to your account.',
    hint: "Make sure you have access to Reporting — Owners and Admins can see this.",
  },
  {
    num: "2",
    title: 'Go to Reporting → Balance',
    body: 'In the left sidebar: Reports → Balance. You\'ll see a table of all transactions.',
    hint: 'URL looks like: dashboard.stripe.com/reports/balance',
  },
  {
    num: "3",
    title: "Download CSV",
    body: 'Click "Export" (top-right), select date range (last 3–12 months for best results), then Download.',
    hint: "The file will be named something like balance_YYYY-MM-DD.csv",
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
        {STEPS.map(({ num, title, body, hint }) => (
          <div key={num} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white mt-0.5">
              {num}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{body}</p>
              {/* Placeholder for screenshot */}
              <div className="mt-3 rounded-lg bg-gray-100 border border-dashed border-gray-300 h-28 flex items-center justify-center">
                <span className="text-xs text-gray-400">Screenshot placeholder — Step {num}</span>
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
            Make sure you downloaded from <strong>Reports → Balance</strong>, not Payments or Payouts.
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
