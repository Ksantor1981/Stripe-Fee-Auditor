import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getReportWithAccess } from "@/lib/db";
import { resolveReportAccessToken } from "@/lib/report-access-cookie";
import { fmt$, fmtPct } from "@/lib/format";
import { periodTotalFees } from "@/lib/fee-period-copy";
import { getSiteBaseUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata() {
  return {
    title: "Fee snapshot — Stripe Fee Auditor",
    robots: "noindex, nofollow",
  };
}

export default async function EmbedReportPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token: queryToken } = await searchParams;

  if (!UUID_V4.test(id)) notFound();

  const token = resolveReportAccessToken(id, {
    cookieStore: await cookies(),
    queryToken,
  });

  const report = await getReportWithAccess(id, token);
  if (!report?.result) notFound();

  const r = report.result;
  const chargeFees = r.chargeFees;
  const chargeVolume = r.chargeVolume;
  const otherFees = r.otherFees;
  const periodFees = r.allInFees ?? periodTotalFees(chargeFees, otherFees);
  const displayAllIn =
    r.allInRate ?? (chargeVolume > 0 ? (periodFees / chargeVolume) * 100 : 0);

  const base = getSiteBaseUrl();

  return (
    <div className="min-h-[260px] box-border rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 text-slate-900 shadow-sm antialiased">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">
            Stripe Fee Auditor
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{fmtPct(displayAllIn)}</p>
          <p className="text-xs text-slate-500">All-in cost rate (this export)</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-slate-800">{fmtPct(r.chargeRate)}</p>
          <p className="text-[10px] text-slate-500">Processing rate</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/80 px-3 py-2 border border-slate-100">
          <p className="text-slate-400">Charge volume</p>
          <p className="font-semibold text-slate-900">{fmt$(chargeVolume)}</p>
        </div>
        <div className="rounded-lg bg-white/80 px-3 py-2 border border-slate-100">
          <p className="text-slate-400">All-in fees</p>
          <p className="font-semibold text-slate-900">{fmt$(periodFees)}</p>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-snug text-slate-400">
        Snapshot only — not financial advice. Compare your full export on the site.
      </p>

      <Link
        href={`${base}/analyze?utm_source=embed&utm_medium=widget`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Run your own audit →
      </Link>
      <p className="mt-2 text-center">
        <Link href={base} className="text-[10px] text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline">
          feeauditor.com
        </Link>
      </p>
    </div>
  );
}
