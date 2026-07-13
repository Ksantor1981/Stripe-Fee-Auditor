"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = {
  source?: string;
  ctaLabel?: string;
};

export function ChromeExtensionEarlyAccessForm({
  source = "chrome_extension_early_access",
  ctaLabel = "Join early access",
}: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackEvent("funnel_newsletter_view", { source });
  }, [source]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setError(null);
    setLoading(true);
    trackEvent("funnel_newsletter_submit", { source });

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Something went wrong. Try again.");
        return;
      }

      trackEvent("funnel_newsletter_success", { source });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-center">
        <p className="font-semibold text-emerald-950">You are on the Chrome helper list.</p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-700">
          I will email you when the Web Store listing is live or when a packaged early-access build is ready.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {loading ? "Joining..." : ctaLabel}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        No spam. I will only use this for Chrome helper updates and occasional Stripe fee notes.
      </p>
    </form>
  );
}
