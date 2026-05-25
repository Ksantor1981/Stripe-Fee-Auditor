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
        <p className="font-semibold text-emerald-900">You&apos;re on the list.</p>
        <p className="text-sm text-emerald-700 mt-1">
          Check your inbox for a confirmation. We&apos;ll email you again when Fee Monitor beta opens.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-white shadow-sm p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
        Coming soon
      </p>
      <h3 className="text-base font-bold text-gray-900 mb-2">
        Want to know if this rate gets worse next month?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Fee Monitor will keep a private history of your CSV-based audits and compare each new upload with the previous one. No OAuth; you stay in control of every export.
      </p>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
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
          className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-2.5 text-sm transition-colors whitespace-nowrap"
        >
          {loading ? "Joining..." : "Join early list"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-gray-500">
        Curious first? <a href="/monitor" className="text-blue-600 hover:underline">See what we are validating</a>.
      </p>
    </div>
  );
}
