"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { trackEvent } from "@/lib/analytics";
import { fmtPct } from "@/lib/format";
import { periodTotalFees } from "@/lib/fee-period-copy";
import { getSiteBaseUrl } from "@/lib/site-url";
import {
  REGION_BENCHMARKS,
  getRegionBenchmark,
  type RegionBenchmarkId,
} from "@/lib/region-benchmark";
import { buildTwitterIntentUrl } from "@/lib/share-copy";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

const REGION_STORAGE_KEY = "fee_auditor_region_benchmark";

interface Props {
  /** Includes token for third-party iframe embeds (intentionally shareable). */
  embedShareUrl: string;
  result: Pick<
    AnalysisResult,
    "chargeRate" | "allInRate" | "chargeVolume" | "chargeFees" | "otherFees" | "allInFees" | "feeGrade"
  >;
}

export function ShareEmbedBenchmark({ embedShareUrl, result }: Props) {
  const { t } = useReportTranslations();
  const [regionId, setRegionId] = useState<RegionBenchmarkId>("us");
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [pngBusy, setPngBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REGION_STORAGE_KEY) as RegionBenchmarkId | null;
      if (saved && REGION_BENCHMARKS.some((r) => r.id === saved)) setRegionId(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REGION_STORAGE_KEY, regionId);
    } catch {
      /* ignore */
    }
  }, [regionId]);

  const periodFees =
    result.allInFees ?? periodTotalFees(result.chargeFees, result.otherFees);
  const displayAllInRate =
    result.allInRate ??
    (result.chargeVolume > 0 ? (periodFees / result.chargeVolume) * 100 : 0);

  const region = useMemo(() => getRegionBenchmark(regionId), [regionId]);
  const deltaVsTypical = displayAllInRate - region.typicalMidPct;

  const iframeSnippet = `<iframe src="${embedShareUrl}" width="100%" height="300" style="border:0;border-radius:12px;max-width:440px;background:#fff" loading="lazy" title="Stripe Fee Auditor snapshot"></iframe>`;

  const shareUrl = useMemo(() => {
    const base = getSiteBaseUrl();
    const marketing = `${base}/?utm_source=twitter&utm_medium=social&utm_campaign=share_snippet`;
    const handle = process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? "feeauditor";
    return buildTwitterIntentUrl({
      actualRatePct: displayAllInRate,
      siteUrl: marketing,
      twitterHandle: handle,
      feeGradeLetter: result.feeGrade?.letter,
    });
  }, [displayAllInRate, result.feeGrade?.letter]);

  const openTwitter = useCallback(() => {
    trackEvent("funnel_share_x_click", { region: regionId });
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=420");
  }, [shareUrl, regionId]);

  const copyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopiedEmbed(true);
      trackEvent("funnel_embed_copy", {});
      window.setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      /* ignore */
    }
  }, [iframeSnippet]);

  const downloadChartPng = useCallback(async () => {
    const el =
      document.getElementById("fee-dashboard-charts") ??
      document.getElementById("report-share-snapshot");
    if (!el) return;
    setPngBusy(true);
    try {
      trackEvent("funnel_share_chart_png", {});
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const reportIdMatch = embedShareUrl.match(/\/embed\/([^/?]+)/);
      a.download = `stripe-fee-auditor-${(reportIdMatch?.[1] ?? "chart").slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPngBusy(false);
    }
  }, [embedShareUrl]);

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-6 shadow-sm space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-1">
          {t("shareEmbedBenchmark.eyebrow")}
        </p>
        <h2 className="text-lg font-bold text-gray-900">
          {t("shareEmbedBenchmark.title")}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {t("shareEmbedBenchmark.bodyIntro", { rate: fmtPct(displayAllInRate) })}
          {result.feeGrade ? (
            <>
              {t("shareEmbedBenchmark.bodyGrade", { grade: result.feeGrade.letter })}
            </>
          ) : null}
          {t("shareEmbedBenchmark.bodySuffix")}
        </p>
      </div>

      <div className="rounded-xl border border-white bg-white/90 px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-sm font-semibold text-gray-800">{t("shareEmbedBenchmark.regionalBenchmark")}</p>
          <select
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value as RegionBenchmarkId)}
          >
            {REGION_BENCHMARKS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed">
          {t("shareEmbedBenchmark.effectiveRateBody", {
            rate: fmtPct(displayAllInRate),
            region: region.label,
            midpoint: fmtPct(region.typicalMidPct),
          })}
          {deltaVsTypical >= 0.05 ? (
            t("shareEmbedBenchmark.runningHigher", { delta: Math.abs(deltaVsTypical).toFixed(2) })
          ) : deltaVsTypical <= -0.05 ? (
            t("shareEmbedBenchmark.runningLower", { delta: Math.abs(deltaVsTypical).toFixed(2) })
          ) : (
            t("shareEmbedBenchmark.inLine")
          )}
        </p>
        <p className="text-[11px] text-gray-400 mt-2 leading-snug">{region.context}</p>
        <p className="text-[10px] text-gray-400 mt-2 italic">
          {t("shareEmbedBenchmark.midpointDisclaimer")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="bg-gray-900 hover:bg-gray-800 text-white"
          onClick={openTwitter}
        >
          {t("shareEmbedBenchmark.shareTwitter")}
        </Button>
        <Button type="button" variant="outline" disabled={pngBusy} onClick={() => void downloadChartPng()}>
          {pngBusy ? t("shareEmbedBenchmark.savingPng") : t("shareEmbedBenchmark.downloadChartPng")}
        </Button>
      </div>
      <p className="text-[11px] text-gray-400">
        {t("shareEmbedBenchmark.twitterHint")}
      </p>

      <div className="rounded-xl border border-gray-100 bg-[#f0f1ee]/90 px-4 py-4">
        <p className="text-sm font-semibold text-gray-800 mb-1">{t("shareEmbedBenchmark.embedTitle")}</p>
        <p className="text-xs text-gray-500 mb-3">
          {t("shareEmbedBenchmark.embedBody")}
        </p>
        <textarea
          readOnly
          className="w-full text-[11px] font-mono text-gray-700 bg-white border border-gray-200 rounded-lg p-3 h-[72px] resize-none"
          value={iframeSnippet}
        />
        <Button type="button" variant="secondary" className="mt-2" onClick={() => void copyEmbed()}>
          {copiedEmbed ? t("shareEmbedBenchmark.copied") : t("shareEmbedBenchmark.copyEmbed")}
        </Button>
      </div>
    </div>
  );
}
