import type { AnalysisResult, FeeLeakBreakdownKind } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";

const KIND_LABEL: Record<FeeLeakBreakdownKind, string> = {
  direct: "Direct from CSV",
  calculated: "Calculated from direct rows",
  estimated: "Directional estimate",
};

export function ReportReconciliation({ result }: { result: AnalysisResult }) {
  const reconciliation = result.reconciliation;
  if (!reconciliation) return null;

  const evidenceKinds = new Set((result.feeLeakBreakdown ?? []).map((item) => item.kind));
  const accountLabel = result.pricingProfile?.label ?? result.accountCountry ?? "United States";

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Source-row reconciliation
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">How the report totals tie out</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Arithmetic check against uploaded Balance rows. This is not payout, bank, or general-ledger reconciliation.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            reconciliation.status === "reconciled"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {reconciliation.status === "reconciled"
            ? "Charge rows tie out"
            : `${reconciliation.mismatchedChargeRows} charge rows need review`}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Source rows", reconciliation.sourceRowCount.toLocaleString("en-US")],
          ["Charge volume", fmt$(reconciliation.chargeVolume)],
          ["Direct charge fees", fmt$(reconciliation.chargeFees)],
          ["Other direct fee rows", fmt$(reconciliation.otherFees)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-base font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
        <span>{reconciliation.chargeRowCount.toLocaleString("en-US")} charge rows</span>
        <span>{reconciliation.nonChargeRowCount.toLocaleString("en-US")} non-charge rows</span>
        <span>{reconciliation.directNonChargeFeeRows.toLocaleString("en-US")} direct non-charge fee rows</span>
        <span>Account benchmark: {accountLabel}</span>
      </div>

      {evidenceKinds.size > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {[...evidenceKinds].map((kind) => (
            <span key={kind} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {KIND_LABEL[kind]}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
