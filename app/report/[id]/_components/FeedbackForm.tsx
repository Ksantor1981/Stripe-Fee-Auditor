"use client";

import { useState } from "react";

export function FeedbackForm({ reportId }: { reportId: string }) {
  const [useful, setUseful] = useState<"yes" | "no" | null>(null);
  const [missing, setMissing] = useState("");
  const [willPay, setWillPay] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!useful) return;
    setLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, useful, missing, willPay }),
      });
      setSubmitted(true);
    } catch {
      // fail silently — feedback is non-critical
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-semibold text-gray-900">Thank you!</p>
        <p className="text-sm text-gray-500 mt-1">
          Your feedback helps make the tool better.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        Quick feedback
      </p>
      <h3 className="text-base font-bold text-gray-900 mb-4">
        Was this report useful?
      </h3>

      {/* Was it useful */}
      <div className="flex gap-3 mb-5">
        {(["yes", "no"] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setUseful(val)}
            className={[
              "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors",
              useful === val
                ? val === "yes"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-red-300 bg-red-50 text-red-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300",
            ].join(" ")}
          >
            {val === "yes" ? "👍 Yes, useful" : "👎 Not really"}
          </button>
        ))}
      </div>

      {/* What's missing */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What&apos;s missing or could be better?
        </label>
        <textarea
          value={missing}
          onChange={(e) => setMissing(e.target.value)}
          placeholder="E.g. I wanted to see... / It was confusing when..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200 resize-none"
        />
      </div>

      {/* Would you pay */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Would you pay for this? If yes — how much feels fair?
        </label>
        <input
          value={willPay}
          onChange={(e) => setWillPay(e.target.value)}
          placeholder="E.g. $5 one-time / $10/month / No"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!useful || loading}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 text-sm transition-colors"
      >
        {loading ? "Sending..." : "Send Feedback"}
      </button>
    </div>
  );
}
