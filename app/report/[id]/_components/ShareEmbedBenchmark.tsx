"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { trackEvent } from "@/lib/analytics";
import { fmtPct } from "@/lib/format";
import { periodTotalFees } from "@/lib/fee-period-copy";
import {
  REGION_BENCHMARKS,
  getRegionBenchmark,
  type RegionBenchmarkId,
} from "@/lib/region-benchmark";
import { createShareCardCanvas, downloadCanvasPng } from "@/lib/share-card-png";
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
  const [pngError, setPngError] = useState<string | null>(null);

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
    setPngError(null);
    setPngBusy(true);
    try {
      trackEvent("funnel_share_chart_png", {});
      const canvas = createShareCardCanvas({
        brand: t("shareEmbedBenchmark.pngBrand"),
        allInLabel: t("shareEmbedBenchmark.pngAllIn"),
        allInValue: fmtPct(displayAllInRate),
        processingLabel: t("shareEmbedBenchmark.pngProcessing"),
        processingValue: fmtPct(result.chargeRate),
        gradeText: result.feeGrade
          ? t("shareEmbedBenchmark.pngGrade", { grade: result.feeGrade.letter })
          : undefined,
        footer: t("shareEmbedBenchmark.pngFooter"),
      });
      const reportIdMatch = embedShareUrl.match(/\/embed\/([^/?]+)/);
      await downloadCanvasPng(
        canvas,
        `stripe-fee-auditor-${(reportIdMatch?.[1] ?? "chart").slice(0, 8)}.png`,
      );
    } catch {
      setPngError(t("shareEmbedBenchmark.pngError"));
    } finally {
      setPngBusy(false);
    }
  }, [displayAllInRate, embedShareUrl, result.chargeRate, result.feeGrade, t]);

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
        <Button type="button" variant="outline" disabled={pngBusy} onClick={() => void downloadChartPng()}>
          {pngBusy ? t("shareEmbedBenchmark.savingPng") : t("shareEmbedBenchmark.downloadChartPng")}
        </Button>
      </div>
      {pngError ? <p className="text-sm text-red-600">{pngError}</p> : null}

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
