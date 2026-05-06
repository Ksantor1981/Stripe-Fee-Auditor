import { notFound } from "next/navigation";
import { getReportWithAccess } from "@/lib/db";
import { fmt$, fmtPct, fmtMonth, fmtDate } from "@/lib/format";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { PrintButton } from "../_components/PrintButton";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ReportPrintPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token = "" } = await searchParams;

  if (!UUID_V4.test(id)) notFound();

  const report = await getReportWithAccess(id, token);
  if (!report?.result || !report.is_paid) notFound();

  const { chargeVolume, chargeFees, chargeRate, otherFees, monthly, anomalies, topDrivers, mode, periodDelta } = report.result;
  const params_id = id;
  const periodFees = periodTotalFees(chargeFees, otherFees);
  const monthCount = monthly.length;
  const yearlyAtThisRate = annualRunRate(periodFees, Math.max(1, monthCount));

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 20mm 15mm; }
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; color: #111; background: white; }
        .page { max-width: 780px; margin: 0 auto; padding: 32px 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .header h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
        .header .meta { font-size: 12px; color: #6b7280; }
        .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
        .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
        .card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; }
        .card .label { font-size: 10px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .card .value { font-size: 18px; font-weight: 700; }
        .card.accent { background: #eff6ff; border-color: #bfdbfe; }
        .card.accent .label { color: #3b82f6; }
        .card.accent .value { color: #1d4ed8; }
        .section { margin-bottom: 28px; }
        .section h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #374151; margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; font-weight: 600; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
        td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; }
        tr:hover td { background: #f9fafb; }
        .anomaly-badge { display: inline-block; background: #fef2f2; color: #dc2626; font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
        .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
        .print-btn { position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: white; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .print-btn:hover { background: #1d4ed8; }
        .delta-pos { color: #dc2626; font-weight: 600; }
        .delta-neg { color: #16a34a; font-weight: 600; }
      `}</style>

      <div className="page">
        {/* Header */}
        <div className="header">
          <div>
            <h1>Stripe Fee Analysis Report</h1>
            <div className="meta">
              Report ID: {params_id.slice(0, 8)} · Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="badge">{mode.replace("-", " ")}</span>
            <div className="meta" style={{ marginTop: 4 }}>{monthly.length} month{monthly.length !== 1 ? "s" : ""} analyzed</div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="cards">
          <div className="card accent">
            <div className="label">Effective Rate</div>
            <div className="value">{fmtPct(chargeRate)}</div>
          </div>
          <div className="card">
            <div className="label">Charge Fees</div>
            <div className="value">{fmt$(chargeFees)}</div>
          </div>
          <div className="card">
            <div className="label">Charge Volume</div>
            <div className="value">{fmt$(chargeVolume)}</div>
          </div>
          <div className="card">
            <div className="label">Other Fees</div>
            <div className="value">{fmt$(otherFees)}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.55 }}>
          <p style={{ margin: "0 0 6px" }}>
            You paid <strong>{fmt$(periodFees)}</strong> in Stripe fees {stripeFeesPeriodTail(monthCount || 1)}
          </p>
          <p style={{ margin: 0, color: "#4b5563" }}>
            That&apos;s <strong>{fmt$(yearlyAtThisRate)}</strong>/year at this rate.
          </p>
        </div>

        {/* Period delta */}
        {periodDelta !== null && (
          <div style={{ marginBottom: 24, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}>
            <strong>Period comparison:</strong>{" "}
            <span className={periodDelta > 0 ? "delta-pos" : "delta-neg"}>
              {periodDelta > 0 ? "▲" : "▼"} {fmt$(Math.abs(periodDelta))}
            </span>{" "}
            vs previous period ({fmtMonth(monthly[monthly.length - 2]?.month ?? "")})
          </div>
        )}

        {/* Monthly breakdown */}
        {monthly.length > 0 && (
          <div className="section">
            <h2>Monthly Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign: "right" }}>Volume</th>
                  <th style={{ textAlign: "right" }}>Fees</th>
                  <th style={{ textAlign: "right" }}>Rate</th>
                  <th style={{ textAlign: "right" }}>Charges</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => {
                  const prev = monthly[i - 1];
                  const delta = prev ? m.fees - prev.fees : null;
                  return (
                    <tr key={m.month}>
                      <td style={{ fontWeight: 600 }}>{fmtMonth(m.month)}</td>
                      <td style={{ textAlign: "right" }}>{fmt$(m.volume)}</td>
                      <td style={{ textAlign: "right" }}>
                        {fmt$(m.fees)}
                        {delta !== null && (
                          <span style={{ fontSize: 10, marginLeft: 4, color: delta > 0 ? "#dc2626" : "#16a34a" }}>
                            {delta > 0 ? "▲" : "▼"}{fmt$(Math.abs(delta))}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>{fmtPct(m.rate)}</td>
                      <td style={{ textAlign: "right", color: "#9ca3af" }}>{m.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <div className="section">
            <h2>Anomalies ({anomalies.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Fee</th>
                  <th style={{ textAlign: "right" }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.slice(0, 30).map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{r.id}</td>
                    <td>{fmtDate(r.date)}</td>
                    <td style={{ textAlign: "right" }}>{fmt$(r.amount)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt$(r.fee)}</td>
                    <td style={{ textAlign: "right" }}>
                      <span className="anomaly-badge">
                        {r.amount > 0 ? fmtPct((r.fee / r.amount) * 100) : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Top drivers */}
        {topDrivers.length > 0 && (
          <div className="section">
            <h2>Top Fee Drivers</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Fee</th>
                  <th style={{ textAlign: "right" }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.slice(0, 10).map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ color: "#d1d5db", fontWeight: 700, fontSize: 11 }}>{i + 1}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{r.id}</td>
                    <td>{fmtDate(r.date)}</td>
                    <td style={{ textAlign: "right" }}>{fmt$(r.amount)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt$(r.fee)}</td>
                    <td style={{ textAlign: "right", color: "#6b7280" }}>
                      {r.amount > 0 ? fmtPct((r.fee / r.amount) * 100) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <span>Stripe Fee Auditor · Not affiliated with Stripe, Inc.</span>
          <span>stripe-fee-auditor.vercel.app</span>
        </div>
      </div>

      {/* Print button — hidden when printing */}
      <PrintButton />
    </>
  );
}
