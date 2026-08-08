/**
 * Stripe Test Data Generator for Fee Auditor screenshots / sample CSV.
 *
 * Uses Stripe **test PaymentMethod fixtures** (pm_card_visa, etc.) — no raw card
 * numbers, works without enabling "raw card data APIs" on your account.
 *
 * Note: built-in test PMs are US-domestic. Descriptions still label "intl" rows for
 * CSV volume; for international **fee uplift** in Fee Auditor, use the built-in
 * sample report or enable raw-card mode (see --mode=raw).
 *
 * Run (PowerShell):
 *   cd "C:\project\Stripe Fee Auditor"
 *   npm run seed:stripe-test
 *
 * STRIPE_SECRET_KEY in .env.local (sk_test_... only) or shell env.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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
  const modeArg = argv.find((a) => a.startsWith("--mode="));
  const mode = modeArg?.split("=")[1] ?? "pm";
  if (mode !== "pm" && mode !== "raw") {
    console.error(`Unknown --mode=${mode}. Use --mode=pm (default) or --mode=raw.`);
    process.exit(1);
  }
  return { dryRun, mode };
}

loadEnvLocal();
const { dryRun, mode } = parseArgs(process.argv.slice(2));

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!dryRun && !secretKey) {
  console.error(
    "Missing STRIPE_SECRET_KEY. Set it in .env.local or pass in the shell (sk_test_... only)."
  );
  process.exit(1);
}
if (!dryRun && secretKey && !secretKey.startsWith("sk_test_")) {
  console.error("Refusing to run: STRIPE_SECRET_KEY must be a test key (sk_test_...).");
  process.exit(1);
}

const stripe = secretKey ? new Stripe(secretKey) : null;

/** Magic test PaymentMethod IDs — work on any sk_test_ account, no raw card API. */
const TEST_PAYMENT_METHODS = {
  domestic: [
    { id: "pm_card_visa", name: "US Visa (test PM)" },
    { id: "pm_card_mastercard", name: "US Mastercard (test PM)" },
    { id: "pm_card_amex", name: "US Amex (test PM)" },
  ],
  international: [
    { id: "pm_card_visa", name: "US Visa stand-in (intl label only)" },
    { id: "pm_card_mastercard", name: "US MC stand-in (intl label only)" },
  ],
};

const RAW_TEST_CARDS = {
  domestic: [
    { number: "4242424242424242", name: "US Visa domestic" },
    { number: "5555555555554444", name: "US Mastercard domestic" },
    { number: "378282246310005", name: "US Amex domestic" },
  ],
  international: [
    { number: "4000000760000002", name: "Brazil Visa" },
    { number: "4000001240000000", name: "Canada Visa" },
    { number: "4000004840000008", name: "Mexico Visa" },
    { number: "4000008260000000", name: "UK Visa" },
    { number: "4000002760000016", name: "Germany Visa" },
    { number: "4000003800000446", name: "Australia Visa" },
  ],
};

const TRANSACTIONS = [
  { amount: 500, card: "domestic", description: "Small plan monthly" },
  { amount: 900, card: "domestic", description: "Starter subscription" },
  { amount: 1200, card: "domestic", description: "Basic tier" },
  { amount: 700, card: "international", description: "Micro purchase EU" },
  { amount: 800, card: "international", description: "Small intl payment" },
  { amount: 2900, card: "domestic", description: "Pro monthly" },
  { amount: 4900, card: "domestic", description: "Business plan" },
  { amount: 3500, card: "international", description: "Pro plan Brazil" },
  { amount: 2900, card: "international", description: "Standard UK" },
  { amount: 4900, card: "international", description: "Business Canada" },
  { amount: 9900, card: "domestic", description: "Enterprise monthly" },
  { amount: 14900, card: "domestic", description: "Annual plan" },
  { amount: 9900, card: "international", description: "Enterprise EU" },
  { amount: 19900, card: "international", description: "Large intl deal" },
  { amount: 7500, card: "domestic", description: "Team plan" },
  { amount: 2900, card: "domestic", description: "Pro renewal" },
  { amount: 4900, card: "domestic", description: "Business renewal" },
  { amount: 9900, card: "domestic", description: "Enterprise renewal" },
  { amount: 3500, card: "international", description: "Intl renewal" },
  { amount: 1900, card: "international", description: "Starter intl" },
];

const REFUND_INDICES = [0, 3, 8];
const PAUSE_MS = Number(process.env.STRIPE_SEED_PAUSE_MS ?? 350);

let intlFeeWarningShown = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickPm(cardType) {
  const list = TEST_PAYMENT_METHODS[cardType];
  return list[Math.floor(Math.random() * list.length)];
}

function pickRawCard(cardType) {
  const list = RAW_TEST_CARDS[cardType];
  return list[Math.floor(Math.random() * list.length)];
}

async function createWithTestPm(amount, cardType, description) {
  const pm = pickPm(cardType);
  if (cardType === "international" && mode === "pm" && !intlFeeWarningShown) {
    intlFeeWarningShown = true;
    console.log(
      "ℹ️  Intl rows use US test PMs (Stripe has no intl pm_card_*). " +
        "Balance CSV is fine for Dashboard screenshots; use Fee Auditor sample for intl fee uplift.\n"
    );
  }

  const pi = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method: pm.id,
    confirm: true,
    off_session: true,
    description: `${description} (${pm.name})`,
    metadata: { seed: "feeauditor_screenshots_v1", card_type: cardType, pm_mode: "fixture" },
  });

  if (pi.status !== "succeeded") {
    console.log(`⚠️  ${description}: status ${pi.status} (${pi.id})`);
    return null;
  }

  console.log(
    `✅ ${description}: $${(amount / 100).toFixed(2)} [${pm.name}] → ${pi.id}`
  );
  return { pi, amount, card: cardType, description };
}

async function createWithRawCard(amount, cardType, description) {
  const card = pickRawCard(cardType);

  const pm = await stripe.paymentMethods.create({
    type: "card",
    card: {
      number: card.number,
      exp_month: 12,
      exp_year: 2028,
      cvc: "123",
    },
  });

  const pi = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method: pm.id,
    confirm: true,
    off_session: true,
    description: `${description} (${card.name})`,
    metadata: { seed: "feeauditor_screenshots_v1", card_type: cardType, pm_mode: "raw" },
  });

  if (pi.status !== "succeeded") {
    console.log(`⚠️  ${description}: status ${pi.status} (${pi.id})`);
    return null;
  }

  console.log(
    `✅ ${description}: $${(amount / 100).toFixed(2)} [${card.name}] → ${pi.id}`
  );
  return { pi, amount, card: cardType, description };
}

async function createAndConfirmPayment(amount, cardType, description) {
  try {
    if (mode === "raw") {
      return await createWithRawCard(amount, cardType, description);
    }
    return await createWithTestPm(amount, cardType, description);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`❌ Failed ${description}: ${msg}`);
    if (/raw card data/i.test(msg) && mode === "raw") {
      console.log(
        "   Enable raw card data: https://support.stripe.com/questions/enabling-access-to-raw-card-data-apis"
      );
      console.log("   Or re-run without --mode=raw (default pm_card_* mode).");
    }
    return null;
  }
}

async function main() {
  if (dryRun) {
    console.log(`DRY RUN — mode=${mode}, no API calls.\n`);
    console.log(`Would create ${TRANSACTIONS.length} charges and ${REFUND_INDICES.length} refunds.`);
    return;
  }

  console.log(`🚀 Stripe test data generation (test mode, --mode=${mode})\n`);
  console.log(`📊 Creating ${TRANSACTIONS.length} transactions…\n`);

  const createdPayments = [];

  for (const tx of TRANSACTIONS) {
    const result = await createAndConfirmPayment(tx.amount, tx.card, tx.description);
    if (result) createdPayments.push(result);
    await sleep(PAUSE_MS);
  }

  console.log(`\n💸 Refunding ${REFUND_INDICES.length} payments…\n`);

  for (const idx of REFUND_INDICES) {
    const entry = createdPayments[idx];
    if (!entry?.pi) continue;
    try {
      await stripe.refunds.create({ payment_intent: entry.pi.id });
      console.log(
        `🔄 Refunded: ${entry.description} ($${(entry.amount / 100).toFixed(2)})`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`❌ Refund failed: ${msg}`);
    }
    await sleep(PAUSE_MS);
  }

  const total = createdPayments.reduce((sum, p) => sum + p.amount, 0);
  const intl = createdPayments.filter((p) => p.card === "international");

  console.log("\n✨ Done. Wait 5–10 minutes, then export CSV:");
  console.log("   Dashboard → Reporting → Reports → Balance summary");
  console.log("   → date range (Today) → Export → Itemized → Download\n");
  console.log("📈 Summary:");
  console.log(`   Succeeded charges: ${createdPayments.length}/${TRANSACTIONS.length}`);
  console.log(`   Total volume: $${(total / 100).toFixed(2)}`);
  console.log(
    `   Intl-labeled rows: ${intl.length} (${createdPayments.length ? Math.round((intl.length / createdPayments.length) * 100) : 0}%)`
  );
  console.log(`   Refunds: ${REFUND_INDICES.filter((i) => createdPayments[i]).length}`);

  if (createdPayments.length === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
