"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
import type { PaymentVolumeSegment } from "@/lib/product-analytics";

type InterestType = "monitoring_interest" | "cfo_interest";

type CardProps = {
  type: InterestType;
  reportId: string;
  paymentVolumeSegment: PaymentVolumeSegment;
  title: string;
  body: string;
  cta: string;
};

function InterestCard({ type, reportId, paymentVolumeSegment, title, body, cta }: CardProps) {
  const t = useTranslations("waitlist");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId, source: type, paymentVolumeSegment }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? t("error"));
        return;
      }
      trackEvent(type, { payment_volume_segment: paymentVolumeSegment });
      setSubmitted(true);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
      {submitted ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {t("thanks")}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {loading ? t("joining") : cta}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function MonitorWaitlistForm({
  reportId,
  paymentVolumeSegment,
}: {
  reportId: string;
  paymentVolumeSegment: PaymentVolumeSegment;
}) {
  const t = useTranslations("waitlist");

  useEffect(() => {
    trackEvent("waitlist_view", {
      source: "post_report_early_access",
      payment_volume_segment: paymentVolumeSegment,
    });
  }, [paymentVolumeSegment]);

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        {t("eyebrow")}
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <InterestCard
          type="monitoring_interest"
          reportId={reportId}
          paymentVolumeSegment={paymentVolumeSegment}
          title={t("monitorTitle")}
          body={t("monitorBody")}
          cta={t("monitorCta")}
        />
        <InterestCard
          type="cfo_interest"
          reportId={reportId}
          paymentVolumeSegment={paymentVolumeSegment}
          title={t("cfoTitle")}
          body={t("cfoBody")}
          cta={t("cfoCta")}
        />
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">
        {t("disclaimer")}
      </p>
    </section>
  );
}
