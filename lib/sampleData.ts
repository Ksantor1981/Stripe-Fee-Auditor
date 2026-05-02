// Sample Stripe Balance CSV for demo mode
// Realistic US SaaS data: mix of domestic, international, ACH, refunds
export const SAMPLE_CSV = `id,type,amount,fee,net,currency,created,description
txn_demo001,charge,9900,317,9583,usd,2026-01-28T10:15:00Z,Card payment - Acme Corp - Pro plan
txn_demo002,charge,4900,172,4728,usd,2026-01-29T11:30:00Z,Card payment - TechFlow Inc - Starter plan
txn_demo003,charge,19900,608,19292,usd,2026-01-30T14:20:00Z,Card payment - BuilderCo - Business plan
txn_demo004,charge,9900,461,9439,usd,2026-02-01T09:10:00Z,Card payment - Nexus GmbH - Pro plan [international]
txn_demo005,charge,4900,172,4728,usd,2026-02-03T13:45:00Z,Card payment - Stackify - Starter plan
txn_demo006,charge,49900,1478,48422,usd,2026-02-04T16:00:00Z,Card payment - Pivotal Labs - Enterprise plan
txn_demo007,refund,-9900,0,-9900,usd,2026-02-05T10:00:00Z,Refund for Pro plan - Acme Corp
txn_demo008,charge,9900,317,9583,usd,2026-02-06T11:20:00Z,Card payment - CloudBase - Pro plan
txn_demo009,charge,9900,461,9439,usd,2026-02-10T14:30:00Z,Card payment - Meridian AG - Pro plan [international]
txn_demo010,charge,4900,45,4855,usd,2026-02-12T09:00:00Z,ACH payment - Clearpath - Starter plan
txn_demo011,charge,19900,608,19292,usd,2026-02-14T15:10:00Z,Card payment - DataSync - Business plan
txn_demo012,charge,9900,317,9583,usd,2026-02-18T10:45:00Z,Card payment - GridWorks - Pro plan
txn_demo013,charge,4900,172,4728,usd,2026-02-20T13:20:00Z,Card payment - Loopback - Starter plan
txn_demo014,charge,49900,2295,47605,usd,2026-02-22T16:30:00Z,Card payment - Orbital Ltd - Enterprise plan [international]
txn_demo015,stripe_fee,0,1800,-1800,usd,2026-03-01T08:00:00Z,Stripe Radar fee
txn_demo016,charge,9900,317,9583,usd,2026-03-02T10:00:00Z,Card payment - Vanta Systems - Pro plan
txn_demo017,charge,19900,608,19292,usd,2026-03-04T14:15:00Z,Card payment - Driftwood - Business plan
txn_demo018,charge,4900,172,4728,usd,2026-03-06T11:30:00Z,Card payment - Helix Bio - Starter plan
txn_demo019,charge,99900,2927,96973,usd,2026-03-08T09:45:00Z,Card payment - Ironclad - Annual plan
txn_demo020,charge,9900,461,9439,usd,2026-03-10T15:00:00Z,Card payment - Quantum IO - Pro plan [international]
txn_demo021,charge,4900,45,4855,usd,2026-03-12T10:20:00Z,ACH payment - Sparkline - Starter plan
txn_demo022,refund,-19900,0,-19900,usd,2026-03-13T09:00:00Z,Refund for Business plan - DataSync
txn_demo023,charge,19900,608,19292,usd,2026-03-15T13:45:00Z,Card payment - NovaSoft - Business plan
txn_demo024,charge,9900,317,9583,usd,2026-03-18T16:10:00Z,Card payment - Acme Corp - Pro plan
txn_demo025,charge,29900,1391,28509,usd,2026-03-20T11:00:00Z,Card payment - Nexus GmbH - Growth plan [international]
txn_demo026,charge,4900,172,4728,usd,2026-03-22T14:30:00Z,Card payment - TechFlow Inc - Starter plan
txn_demo027,charge,9900,461,9439,usd,2026-03-25T10:15:00Z,Card payment - Meridian AG - Pro plan [international]
txn_demo028,charge,49900,1478,48422,usd,2026-03-27T15:45:00Z,Card payment - BuilderCo - Enterprise plan
txn_demo029,charge,19900,608,19292,usd,2026-03-29T09:30:00Z,Card payment - Pivotal Labs - Business plan
txn_demo030,payout,-250000,0,-250000,usd,2026-03-31T09:00:00Z,STRIPE PAYOUT`;

export const SAMPLE_COLUMN_MAPPING = {
  id: "id",
  type: "type",
  amount: "amount",
  fee: "fee",
  net: "net",
  currency: "currency",
  created: "created",
};
