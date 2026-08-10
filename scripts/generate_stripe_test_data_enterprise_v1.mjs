/**
 * Enterprise Stripe **test mode** seed — real PaymentIntents (not synthetic CSV).
 *
 * Simulates a large multi-month client with Test Clocks + optional multi-currency
 * (USD / GBP / EUR). Uses --mode=raw for real international card fee uplift.
 *
 * Prerequisites:
 *   STRIPE_SECRET_KEY=sk_test_... in .env.local
 *   Raw card data APIs enabled on the Stripe account (required for --mode=raw):
 *   https://support.stripe.com/questions/enabling-access-to-raw-card-data-apis
 *
 * Run:
 *   npm run seed:stripe-enterprise:dry
 *   npm run seed:stripe-enterprise
 *   npm run seed:stripe-enterprise -- --currency=usd --quick
 *   npm run seed:stripe-enterprise -- --currency=all --months=6 --charges-per-month=40 --mode=raw
 *
 * After run: wait 5–10 min, then export **Itemized Balance CSV per currency**:
 *   Dashboard → Reporting → Balance summary → date range → Export → Itemized
 *   Upload each currency file separately on /analyze with matching account country.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const CLIENT_NAME = "Acme Global Platform";

const RAW_TEST_CARDS = {
  domestic: [
    { number: "4242424242424242", name: "US Visa domestic" },
    { number: "5555555555554444", name: "US Mastercard domestic" },
  ],
  international: [
    { number: "4000000760000002", name: "Brazil Visa" },
    { number: "4000008260000000", name: "UK Visa" },
    { number: "4000002760000016", name: "Germany Visa" },
    { number: "4000003800000446", name: "Australia Visa" },
    { number: "4000001240000000", name: "Canada Visa" },
  ],
};

const CURRENCY_META = {
  usd: { accountCountry: "US", label: "USD" },
  gbp: { accountCountry: "UK", label: "GBP" },
  eur: { accountCountry: "EU", label: "EUR" },
};

const CUSTOMERS = [
  "Northwind Analytics",
  "Helix Bio Labs",
  "Meridian AG",
  "Nexus GmbH",
  "BuilderCo Enterprise",
  "DataSync Corp",
  "Orbit Commerce",
  "Pacific Retail Group",
];

function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const quick = argv.includes("--quick");
  const modeArg = argv.find((a) => a.startsWith("--mode="));
  const mode = modeArg?.split("=")[1] ?? "pm";
  const currencyArg = argv.find((a) => a.startsWith("--currency="));
  const currency = currencyArg?.split("=")[1]?.toLowerCase() ?? "all";
  const monthsArg = argv.find((a) => a.startsWith("--months="));
  const chargesArg = argv.find((a) => a.startsWith("--charges-per-month="));

  let months = Number(monthsArg?.split("=")[1] ?? 6);
  let chargesPerMonth = Number(chargesArg?.split("=")[1] ?? 40);

  if (quick) {
    months = 2;
    chargesPerMonth = 20;
  }

  if (!["pm", "raw"].includes(mode)) {
    console.error(`Unknown --mode=${mode}. Use raw (recommended) or pm.`);
    process.exit(1);
  }

  const currencies =
    currency === "all" ? ["usd", "gbp", "eur"] : [currency];

  for (const code of currencies) {
    if (!CURRENCY_META[code]) {
      console.error(`Unknown currency ${code}. Use usd, gbp, eur, or all.`);
      process.exit(1);
    }
  }

  return {
    dryRun,
    quick,
    mode,
    currencies,
    months,
    chargesPerMonth,
    pauseMs: Number(process.env.STRIPE_SEED_PAUSE_MS ?? 180),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomAmountMinor() {
  const roll = Math.random();
  if (roll < 0.12) return 450 + Math.floor(Math.random() * 1450);
  if (roll < 0.82) return 2900 + Math.floor(Math.random() * 7100);
  if (roll < 0.95) return 14900 + Math.floor(Math.random() * 35000);
  return 99900 + Math.floor(Math.random() * 200000);
}

function monthStartUnix(monthsAgo, monthsTotal, monthIndex) {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsTotal - 1 - monthIndex), 1, 10, 0, 0)
  );
  return Math.floor(start.getTime() / 1000);
}

async function waitForClockReady(stripe, clockId) {
  for (let attempt = 0; attempt < 90; attempt++) {
    const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
    if (clock.status === "ready") return clock;
    if (clock.status === "internal_failure") {
      throw new Error(`Test clock ${clockId} failed`);
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for test clock ${clockId}`);
}

async function createRawPaymentMethod(stripe, cardType) {
  const card = pick(RAW_TEST_CARDS[cardType]);
  return stripe.paymentMethods.create({
    type: "card",
    card: {
      number: card.number,
      exp_month: 12,
      exp_year: 2028,
      cvc: "123",
    },
    metadata: { seed_card: card.name },
  });
}

async function createFixturePaymentMethod(stripe, cardType) {
  const id = cardType === "international" ? "pm_card_mastercard" : "pm_card_visa";
  return { id, fixture: true };
}

async function chargeCustomer(stripe, opts) {
  const { amount, currency, customerId, description, mode, cardType } = opts;

  let paymentMethodId;
  if (mode === "raw") {
    const pm = await createRawPaymentMethod(stripe, cardType);
    paymentMethodId = pm.id;
  } else {
    const pm = await createFixturePaymentMethod(stripe, cardType);
    paymentMethodId = pm.id;
  }

  const pi = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    off_session: true,
    description,
    metadata: {
      seed: "feeauditor_enterprise_v1",
      card_type: cardType,
      client: CLIENT_NAME,
    },
  });

  if (pi.status !== "succeeded") {
    throw new Error(`PaymentIntent ${pi.id} status ${pi.status}`);
  }
  return pi;
}

async function seedCurrency(stripe, config, currency) {
  const meta = CURRENCY_META[currency];
  const totalCharges = config.months * config.chargesPerMonth;
  console.log(
    `\n━━ ${meta.label} · ${config.months} months · ${config.chargesPerMonth}/mo · ${totalCharges} charges ━━`
  );

  if (config.dryRun) {
    console.log(`DRY RUN — would create test clock + ${totalCharges} charges in ${currency}`);
    return { succeeded: totalCharges, currency, meta };
  }

  const frozenStart = monthStartUnix(0, config.months, 0);
  const clock = await stripe.testHelpers.testClocks.create({
    frozen_time: frozenStart,
    name: `FeeAuditor enterprise ${currency.toUpperCase()}`,
  });

  const customer = await stripe.customers.create({
    test_clock: clock.id,
    email: `enterprise-${currency}@feeauditor.test`,
    name: `${CLIENT_NAME} (${meta.label})`,
    metadata: { seed: "feeauditor_enterprise_v1", currency },
  });

  const created = [];

  for (let month = 0; month < config.months; month++) {
    if (month > 0) {
      const nextFrozen = monthStartUnix(0, config.months, month);
      await stripe.testHelpers.testClocks.advance(clock.id, {
        frozen_time: nextFrozen,
      });
      await waitForClockReady(stripe, clock.id);
      console.log(`⏱  Clock advanced to month ${month + 1}/${config.months}`);
    }

    for (let i = 0; i < config.chargesPerMonth; i++) {
      const cardType = Math.random() < 0.28 ? "international" : "domestic";
      const amount = randomAmountMinor();
      const customerName = pick(CUSTOMERS);
      const profile =
        cardType === "international"
          ? `International card - ${customerName}`
          : `${CLIENT_NAME} subscription — ${customerName}`;

      try {
        const pi = await chargeCustomer(stripe, {
          amount,
          currency,
          customerId: customer.id,
          description: profile,
          mode: config.mode,
          cardType,
        });
        created.push({ pi, amount, cardType, month });
        if ((created.length % 25) === 0) {
          console.log(`   … ${created.length}/${totalCharges} charges (${currency})`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`❌ charge failed: ${msg}`);
        if (/raw card data/i.test(msg) && config.mode === "raw") {
          throw new Error(
            "Enable raw card data APIs on your Stripe test account or rerun with --mode=pm"
          );
        }
      }
      await sleep(config.pauseMs);
    }
  }

  const refundCount = Math.max(3, Math.floor(created.length * 0.04));
  console.log(`\n💸 Refunding ${refundCount} ${currency.toUpperCase()} charges…`);
  for (const entry of created.slice(0, refundCount)) {
    try {
      await stripe.refunds.create({ payment_intent: entry.pi.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`❌ refund failed: ${msg}`);
    }
    await sleep(config.pauseMs);
  }

  const volume = created.reduce((sum, row) => sum + row.amount, 0);
  console.log(
    `\n✅ ${currency.toUpperCase()}: ${created.length}/${totalCharges} succeeded · volume ${(volume / 100).toFixed(2)} ${currency.toUpperCase()}`
  );
  console.log(`   Test clock: ${clock.id} · Customer: ${customer.id}`);
  console.log(`   Fee Auditor upload: account country **${meta.accountCountry}**`);

  return { succeeded: created.length, currency, meta, clockId: clock.id, customerId: customer.id };
}

async function main() {
  loadEnvLocal();
  const config = parseArgs(process.argv.slice(2));

  if (config.dryRun) {
    console.log("DRY RUN — enterprise Stripe seed\n", config);
    for (const currency of config.currencies) {
      await seedCurrency(null, config, currency);
    }
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY in .env.local");
    process.exit(1);
  }
  if (!secretKey.startsWith("sk_test_")) {
    console.error("Refusing to run: STRIPE_SECRET_KEY must be sk_test_...");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);

  console.log("🚀 Enterprise Stripe test seed");
  console.log(`   Client: ${CLIENT_NAME}`);
  console.log(`   Mode: ${config.mode} · Currencies: ${config.currencies.join(", ")}`);
  console.log(
    `   ${config.months} months × ${config.chargesPerMonth} charges/mo (${config.quick ? "quick" : "standard"})`
  );

  const results = [];
  for (const currency of config.currencies) {
    results.push(await seedCurrency(stripe, config, currency));
  }

  console.log("\n✨ Done.");
  console.log("Wait 5–10 minutes, then export **separate Itemized Balance CSV per currency**.");
  console.log("On /analyze pick account country: USD→US, GBP→UK, EUR→EU.\n");
  console.log("Summary:");
  for (const row of results) {
    console.log(
      `   ${row.currency.toUpperCase()}: ${row.succeeded} charges · upload as ${row.meta.accountCountry}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
