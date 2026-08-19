"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { trackEvent } from "@/lib/analytics";

type Props = {
  source?: string;
  ctaLabel?: string;
};

export function FeeMonitorWaitlistForm({
  source = "monitor_page",
  ctaLabel,
}: Props) {
  const t = useTranslations("waitlist");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewTracked = useRef(false);
  const resolvedCta = ctaLabel ?? t("monitorFormCta");

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackEvent("waitlist_view", { source });
  }, [source]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setError(null);
    setLoading(true);
    trackEvent("waitlist_submit", { source });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "monitoring_interest" }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? t("error"));
        return;
      }

      trackEvent("waitlist_success", { source });
      trackEvent("monitoring_interest");
      setSubmitted(true);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
        <p className="font-semibold text-emerald-950">{t("monitorFormThanksTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-700">
          {t("monitorFormThanksBody")}
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
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {loading ? t("joining") : resolvedCta}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        {t("monitorFormDisclaimer")}
      </p>
    </form>
  );
}
