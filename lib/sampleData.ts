// Sample Stripe Balance CSV for demo mode — 60+ charges across multiple months with explicit fee outliers

const HEADER =
  "id,type,amount,fee,net,currency,created,description";

function isoUtc(year: number, month: number, day: number, hour = 12, minute = 0): string {
  return new Date(Date.UTC(year, month - 1, day, hour, minute))
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
}

function buildSampleCsv(): string {
  const lines: string[] = [HEADER];
  let seq = 1;
  const nextId = () => `txn_demo${String(seq++).padStart(3, "0")}`;

  // Baseline domestic-ish Stripe rates (~3.20%). 21 × 3 months = 63 charges → multi-month + threshold stats.
  for (let month = 1; month <= 3; month++) {
    for (let day = 1; day <= 21; day++) {
      const amount = 9900;
      const fee = 317;
      lines.push(
        `${nextId()},charge,${amount},${fee},${amount - fee},usd,${isoUtc(
          2026,
          month,
          Math.min(day + month - 1, 28)
        )},Demo SaaS subscription payment`
      );
    }
  }

  // Explicit outliers (elevated fee / amount) — should rank as statistical anomalies vs baseline mix.
  const outliers: { amount: number; fee: number; desc: string; month: number; day: number }[] = [
    {
      amount: 10000,
      fee: 2200,
      desc: "Premium fraud-screened charge — routing anomaly",
      month: 1,
      day: 11,
    },
    {
      amount: 49900,
      fee: 8990,
      desc: "Enterprise payment — FX cross-border premium",
      month: 2,
      day: 9,
    },
    {
      amount: 4900,
      fee: 1470,
      desc: "Micropayment — fixed fee dominates",
      month: 3,
      day: 7,
    },
    {
      amount: 19900,
      fee: 4975,
      desc: "Manual capture — elevated interchange",
      month: 1,
      day: 22,
    },
    {
      amount: 9900,
      fee: 2890,
      desc: "International card premium corridor",
      month: 2,
      day: 18,
    },
    {
      amount: 29900,
      fee: 6880,
      desc: "Corporate purchasing card uplift",
      month: 3,
      day: 16,
    },
  ];

  for (const o of outliers) {
    lines.push(
      `${nextId()},charge,${o.amount},${o.fee},${o.amount - o.fee},usd,${isoUtc(
        2026,
        o.month,
        o.day,
        15
      )},${o.desc}`
    );
  }

  lines.push(
    `${nextId()},refund,-9900,0,-9900,usd,${isoUtc(2026, 2, 14)},Refund partial — demo customer`
  );
  lines.push(
    `${nextId()},refund,-4900,0,-4900,usd,${isoUtc(2026, 3, 10)},Refund starter seat`
  );
  lines.push(
    `${nextId()},stripe_fee,0,2500,-2500,usd,${isoUtc(2026, 3, 1, 8)},Stripe Radar for Fraud Teams`
  );
  lines.push(
    `${nextId()},payout,-400000,0,-400000,usd,${isoUtc(2026, 3, 31, 9)},STRIPE PAYOUT`
  );

  return lines.join("\n");
}

export const SAMPLE_CSV = buildSampleCsv();

export const SAMPLE_COLUMN_MAPPING = {
  id: "id",
  type: "type",
  amount: "amount",
  fee: "fee",
  net: "net",
  currency: "currency",
  created: "created",
};
