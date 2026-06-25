"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const REPORT_WAITLIST_ANALYTICS = { source: "report" as const };

export function MonitorWaitlistForm({ reportId }: { reportId: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewTracked = useRef(false);
  const monitorCheckoutHref = `/api/checkout/monitor?source=report_monitor&return_to=${encodeURIComponent(
    `/report/${reportId}`
  )}`;

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackEvent("waitlist_view", REPORT_WAITLIST_ANALYTICS);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setError(null);
    setLoading(true);
    trackEvent("waitlist_submit", REPORT_WAITLIST_ANALYTICS);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId, source: "report" }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Something went wrong. Try again.");
        return;
      }

      trackEvent("waitlist_success", REPORT_WAITLIST_ANALYTICS);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
        <p className="font-semibold text-emerald-900">You&apos;re on the free list.</p>
        <p className="text-sm text-emerald-700 mt-1">
          Check your inbox for a confirmation. We&apos;ll send occasional fee notes and product updates.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
        Fee Monitor · $9/mo
      </p>
      <h3 className="text-base font-bold text-gray-900 mb-2">
        Want to know if this rate gets worse next month?
      </h3>
      <p className="mx-auto mb-4 max-w-2xl text-sm text-gray-600">
        Subscribe for monthly CSV reminders, rate drift checks, and first access to private report history as it ships. No Stripe OAuth; you stay in control of every export.
      </p>

      <a
        href={monitorCheckoutHref}
        onClick={() => trackEvent("monitor_checkout_click", REPORT_WAITLIST_ANALYTICS)}
        className="mx-auto flex h-11 w-full max-w-md items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        Start Fee Monitor - $9/mo
      </a>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-blue-100" />
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">or</span>
        <div className="h-px flex-1 bg-blue-100" />
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
        Not ready yet?
      </p>

      <form onSubmit={submit} className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100 transition-colors hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-gray-100 whitespace-nowrap"
        >
          {loading ? "Joining..." : "Join free list"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-gray-500">
        Curious first? <a href="/monitor" className="text-blue-600 hover:underline">See what is included</a>.
      </p>
    </div>
  );
}
