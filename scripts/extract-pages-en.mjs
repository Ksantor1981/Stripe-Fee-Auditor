/**
 * Builds messages/pages/en.json from marketing page sources.
 * Run: node scripts/extract-pages-en.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "messages", "pages", "en.json");

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function readPageSource(dir) {
  const snap = `scripts/seo-sources/${dir}.page.tsx`;
  const live = `app/${dir}/page.tsx`;
  return readFile(fs.existsSync(path.join(ROOT, snap)) ? snap : live);
}

function extractStringConst(source, name) {
  const re = new RegExp(`const ${name}\\s*=\\s*"([^"]*)"`, "m");
  const m = source.match(re);
  return m ? m[1] : null;
}

function extractMetadataTitle(source) {
  const m = source.match(/title:\s*"([^"]+)"/);
  return m ? m[1].replace(/ \| Fee Auditor$/, "") : null;
}

function extractMetadataDescription(source) {
  const m = source.match(/description:\s*\n?\s*"([^"]+)"/);
  return m ? m[1] : null;
}

function extractBalancedLiteral(source, constName) {
  const startRe = new RegExp(`(?:export\\s+)?const ${constName}(?::[^=]+)?\\s*=\\s*([\\[{])`, "m");
  const startMatch = source.match(startRe);
  if (!startMatch) return null;
  const openIdx = startMatch.index + startMatch[0].length - 1;
  const openChar = startMatch[1];
  const closeChar = openChar === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) return source.slice(openIdx, i + 1);
    }
  }
  return null;
}

function evalConstLiteral(source, constName, extraContext = {}) {
  const literal = extractBalancedLiteral(source, constName);
  if (!literal) return null;
  let code = literal
    .replace(/\(\s*<>[\s\S]*?<\/>\s*\)/g, '""')
    .replace(/as const/g, "")
    .replace(/:\s*Metadata[^,]*/g, "")
    .replace(/:\s*ProviderComparisonConfig[^=]*=/g, "=")
    .replace(/:\s*ProviderScenario\[\][^=]*/g, "")
    .replace(/:\s*ProviderDecisionCard\[\][^=]*/g, "")
    .replace(/:\s*ProviderComparisonSource\[\][^=]*/g, "")
    .replace(/:\s*Props[^)]*\)[^{]*/g, "");
  try {
    return vm.runInNewContext(`(${code})`, extraContext, { timeout: 5000 });
  } catch (e) {
    console.warn(`evalConstLiteral failed for ${constName}:`, e.message);
    return null;
  }
}

function stripJsx(html) {
  return html
    .replace(/<Link[^>]*>([\s\S]*?)<\/Link>/gi, "$1")
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "$1")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "$1")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\{[^}]+\}/g, "")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractProseRegion(source) {
  const markers = [
    '<div className="prose',
    '<div className="mt-8 space-y-5',
  ];
  let start = -1;
  for (const m of markers) {
    const idx = source.indexOf(m);
    if (idx !== -1 && (start === -1 || idx < start)) start = idx;
  }
  if (start === -1) return "";
  const faqIdx = source.indexOf("<BlogFaqSection", start);
  if (faqIdx === -1) return source.slice(start, Math.min(start + 120000, source.length));
  return source.slice(start, faqIdx);
}

function extractBlocksFromProse(prose) {
  const intro = [];
  const sections = [];
  if (!prose) return { intro, sections };

  const parts = prose.split(/(<h2[\s\S]*?<\/h2>)/g);
  let currentSection = null;
  for (const part of parts) {
    if (part.match(/^<h2/)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: "section", heading: stripJsx(part), paragraphs: [] };
    } else {
      const paragraphs = [...part.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
        .map((m) => stripJsx(m[1]))
        .filter((p) => p.length > 20 && !p.includes("Try sample") && !p.includes("Free diagnosis"));
      if (currentSection) currentSection.paragraphs.push(...paragraphs);
      else intro.push(...paragraphs);
    }
  }
  if (currentSection) sections.push(currentSection);

  const shortAnswer = prose.match(/Short answer[\s\S]*?<p className="mt-2">([\s\S]*?)<\/p>/);
  if (shortAnswer) {
    sections.unshift({ type: "callout", title: "Short answer", body: stripJsx(shortAnswer[1]) });
  }

  return { intro, sections };
}

function extractReadTime(source) {
  const m = source.match(/(\d+)\s*min read/);
  return m ? `${m[1]} min` : null;
}

function normalizeFaq(items) {
  if (!items) return [];
  return items.map((x) => ({
    q: x.q ?? x.question,
    a: x.a ?? x.answer,
  }));
}

function normalizeBlogFaq(items) {
  if (!items) return [];
  return items.map((x) => ({
    question: x.question ?? x.q,
    answer: x.answer ?? x.a,
  }));
}

function parseBlogPage(slug) {
  const snapshotPath = `scripts/blog-sources/${slug}.page.tsx`;
  const livePath = `app/blog/${slug}/page.tsx`;
  const filePath = fs.existsSync(path.join(ROOT, snapshotPath)) ? snapshotPath : livePath;
  if (!fs.existsSync(path.join(ROOT, filePath))) return null;
  const source = readFile(filePath);
  const pageTitle =
    extractStringConst(source, "pageTitle") ??
    extractStringConst(source, "title") ??
    extractMetadataTitle(source);
  const pageDescription =
    extractStringConst(source, "pageDescription") ??
    extractStringConst(source, "description") ??
    extractMetadataDescription(source);
  const published = extractStringConst(source, "published") ?? extractStringConst(source, "datePublished");
  const updated = extractStringConst(source, "updated") ?? extractStringConst(source, "dateModified");
  const readTime = extractReadTime(source) || "5 min";

  const faqRaw = evalConstLiteral(source, "FAQ_ITEMS") || evalConstLiteral(source, "faqItems") || [];
  const faq = faqRaw.map((x) => ({
    question: x.question ?? x.q,
    answer: x.answer ?? x.a,
  }));
  const sources = evalConstLiteral(source, "SOURCES") || [];
  const tactics = evalConstLiteral(source, "TACTICS");
  const feeTable = evalConstLiteral(source, "FEE_INCREASE_TABLE");

  const proseRegion = extractProseRegion(source);
  const { intro, sections } = extractBlocksFromProse(proseRegion);

  const result = {
    metaTitle: pageTitle,
    metaDescription: pageDescription,
    title: pageTitle,
    readTime,
    publishedAt: published,
    updatedAt: updated,
    intro: intro.length ? intro : undefined,
    sections: sections.length ? sections : undefined,
    faq,
    sources,
  };

  if (tactics) {
    result.table = { headers: ["Tactic", "Potential", "Best fit"], rows: tactics };
  }
  if (feeTable) {
    result.table = { headers: ["Cause", "Fee impact", "CSV signal"], rows: feeTable };
  }

  for (const k of Object.keys(result)) {
    if (result[k] === undefined) delete result[k];
  }
  return result;
}

function extractFaqFromStructuredData(source) {
  const faqBlock = source.match(/"@type":\s*"FAQPage"[\s\S]*?mainEntity:\s*(\[[\s\S]*?\])\s*,?\s*\}/);
  if (!faqBlock) return [];
  try {
    const items = vm.runInNewContext(`(${faqBlock[1]})`, {}, { timeout: 5000 });
    return items.map((item) => ({
      q: item.name,
      a: typeof item.acceptedAnswer === "string" ? item.acceptedAnswer : item.acceptedAnswer?.text,
    }));
  } catch {
    return [];
  }
}

function providerComparisonToSeo(config, pageDescription, faqFromStructured) {
  if (!config) return null;
  return {
    metaTitle: config.pageTitle,
    metaDescription: pageDescription,
    breadcrumb: config.pageTitle,
    eyebrow: config.eyebrow,
    heroTitle: config.h1,
    heroDescription: config.intro,
    sections: [
      { type: "heroCard", title: config.heroTitle, body: config.heroBody },
      { type: "scenarios", heading: "Compare by real payment scenario", rows: config.scenarios },
      { type: "fitCards", goodFit: config.goodFit, badFit: config.badFit },
      { type: "checklist", heading: "Pre-switch checklist", items: config.checklist },
      { type: "sources", heading: "Official pricing sources", items: config.officialSources },
      { type: "related", heading: "Related guides", items: config.related },
    ],
    faq: faqFromStructured,
    cta: {
      title: "Know your real Stripe baseline before comparing providers.",
      description:
        "Upload the itemized Stripe Balance CSV and see your actual processing rate, all-in cost, monthly drift, high-fee charges, and savings ideas.",
      primaryLabel: "Analyze my CSV",
    },
  };
}

function buildSeoPages() {
  const seo = {};
  console.log("buildSeoPages start");

  {
    const s = readPageSource("stripe-fees-report");
    const pageTitle = extractStringConst(s, "pageTitle") ?? "Stripe Fees Report: What to Include Beyond Dashboard Totals";
    const pageDescription =
      extractStringConst(s, "pageDescription") ??
      "A useful Stripe fees report shows processing rate, all-in cost, refund drag, international uplift, and high-fee rows — not just a CSV sum. Export Balance transactions, then audit.";
    seo.stripeFeesReport = {
      metaTitle: pageTitle,
      metaDescription: pageDescription,
      breadcrumb: "Stripe fees report",
      eyebrow: "Stripe fees report",
      heroTitle: pageTitle,
      heroDescription: pageDescription,
      dashboardTitle: "Dashboard export",
      dashboardItems: [
        "Fee rows per Balance transaction",
        "Payout totals and net amounts",
        "Raw export for spreadsheets",
      ],
      reportAddsTitle: "Fees report should add",
      reportAddsItems: [
        { title: "Processing rate vs all-in cost", body: "Separate card processing from refunds, disputes, Radar, Billing, and FX lines so the headline 2.9% is not mistaken for total Stripe drag." },
        { title: "Ranked fee drivers", body: "International cards, micro-transactions, refund fee leakage, and one-off spikes — with dollar impact, not only percentages." },
        { title: "High-fee transaction evidence", body: "Row-level charges you can match back to Stripe Dashboard, useful for finance reviews and CFO client packs." },
        { title: "Directional savings checks", body: "What to verify first (billing cadence, local methods, interchange-plus eligibility) — estimates, not guaranteed savings." },
      ],
      stepsTitle: "Build the report in three steps",
      step1Label: "1. Export",
      step1BeforeLink: "",
      step1LinkText: "Stripe Balance CSV",
      step1LinkHref: "/stripe-balance-csv",
      step1AfterLink: " (itemized, 1–3 months).",
      step2Label: "2. Estimate",
      step2BeforeLink: "optional ",
      step2LinkText: "published-rate calculator",
      step2LinkHref: "/stripe-fee-calculator",
      step2AfterLink: " to set expectations.",
      step3Label: "3. Audit",
      step3Body: "upload the CSV for processing vs all-in rate, drivers, and high-fee rows.",
      faqTitle: "Common questions",
      faq: normalizeFaq(evalConstLiteral(s, "faqItems"))?.length
        ? normalizeFaq(evalConstLiteral(s, "faqItems"))
        : [
            { q: "Is a Stripe fees report the same as the Balance CSV?", a: "The CSV is the source. A fees report is the interpreted view: effective rate, drivers, and actionable rows — without rebuilding pivot tables every month." },
            { q: "Where do I export Stripe transactions for a fee report?", a: "Stripe Dashboard → Reports → Balance → Balance change from activity → Itemized export. See the step-by-step Balance CSV guide linked below." },
            { q: "Can Stripe Dashboard show my effective rate?", a: "You can sum fees manually, but Dashboard does not rank drivers or separate recurring leakage from one-off spikes the way a focused fee audit does." },
          ],
      ctaTitle: "Turn your export into a fees report",
      ctaDescription:
        "Free preview from your Balance CSV — full report adds high-fee rows, savings checks, and exports.",
      ctaPrimary: "Upload Balance CSV →",
    };
  }

  {
    const s = readPageSource("stripe-fee-calculator");
    seo.stripeFeeCalculator = {
      metaTitle: extractStringConst(s, "pageTitle"),
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: extractStringConst(s, "pageTitle"),
      eyebrow: "Stripe fees calculator",
      heroTitle: extractStringConst(s, "pageTitle"),
      heroDescription:
        "Estimate monthly Stripe fees, effective rate, and how much to charge if you want to receive a target amount after fees. Then compare that estimate with your actual effective rate from a Balance CSV, where international cards, refunds, small charges, and add-ons can push the real number higher.",
      sections: [
        { type: "note", body: "Estimates below use Stripe's published rates by region (2025–2026). Your account may differ if you have custom or interchange-plus pricing — confirm in Dashboard → Settings → Plans and fees. Add-ons (Billing 0.7%, disputes, refunds) are not included in the card-fee math." },
        { type: "audience", body: "Stripe Fee Auditor is built for SaaS, ecommerce, subscription, and marketplace teams that need a Stripe fee calculator based on actual Balance CSV exports instead of averages." },
        { type: "rateCards", heading: "Why the difference matters", items: evalConstLiteral(s, "differences") },
        { type: "example", body: "At $50,000/month in revenue, a 3.3% effective rate vs 2.9% published rate is $200/month extra — $2,400/year. Knowing what's driving it tells you what to actually do about it." },
        { type: "comparison", heading: "Estimator vs real data analysis", left: { title: "Fee Estimator", items: ["Enter a transaction amount", "Get Stripe's published fee", "Assumes standard rate", "No history or trends"] }, right: { title: "Stripe Fee Auditor", items: ["Upload your real Balance CSV", "Actual rate from real transactions", "Monthly trend and MoM change", "Specific transactions driving costs"] } },
        { type: "features", heading: "What you get from the analysis", items: evalConstLiteral(s, "whatYouGet") },
      ],
      faq: normalizeFaq(evalConstLiteral(s, "faqItems")),
      cta: {
        title: "Done estimating? This was only published pricing",
        description: "Your real effective rate depends on card mix, refunds, and FX in your Balance CSV. Run the free sample first, or upload your own file — no OAuth.",
        primaryLabel: "Upload my Balance CSV →",
      },
    };
  }

  {
    const s = readPageSource("stripe-balance-csv");
    const steps = evalConstLiteral(s, "steps") || [];
    seo.stripeBalanceCsv = {
      metaTitle: "Export Stripe Balance CSV & Transactions | Fee Auditor",
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: extractStringConst(s, "pageTitle"),
      eyebrow: "Quick export guide · ~5 minutes",
      heroTitle: extractStringConst(s, "pageTitle"),
      heroDescription:
        "This guide is for Stripe users who want to understand their real processing costs: effective rate, payout differences, refund fee leakage, and international card mix. It is not for developers building data pipelines to Tableau, PostgreSQL, Qlik, Power BI, or JSON warehouses.",
      sections: [
        { type: "badge", text: "Not for BI tools or data pipelines" },
        { type: "crossLink", text: "Looking for a broader Stripe data export path instead?", linkLabel: "Stripe exports for JSON, Tableau, Power BI, and PostgreSQL", linkHref: "/stripe-data-export" },
        { type: "steps", heading: "Export steps", steps: steps.map((st) => ({ number: st.number, title: st.title, body: st.schemaText })) },
        { type: "columns", heading: "Key columns in the file", columns: evalConstLiteral(s, "columns"), footnote: "Stripe Dashboard Balance exports usually show amounts in normal currency units (for example, 49.00 USD). API-style cent columns are also accepted when you provide amount / fee / net." },
      ],
      faq: normalizeFaq(evalConstLiteral(s, "faqItems")),
      cta: {
        title: "Got your CSV? Upload it now.",
        description: "Drop your Balance CSV and get your real effective rate, monthly breakdown, and top fee drivers, usually in under 30 seconds.",
        primaryLabel: "Analyze my CSV →",
        secondaryLabel: "See sample report →",
      },
    };
  }

  {
    const s = readPageSource("why-stripe-fee-rate-higher-than-2-9");
    seo.whyHigher = {
      metaTitle: extractStringConst(s, "pageTitle"),
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: extractStringConst(s, "pageTitle"),
      eyebrow: "Fee Auditor · Independent fee education",
      heroTitle: extractStringConst(s, "pageTitle"),
      heroDescription:
        "Stripe advertises 2.9% + $0.30. Your effective rate — and sometimes your payout vs volume — often lands at 3.2–3.8% because of international cards, refund fees that are not returned, FX, and small tickets. Here are the five drivers — with real numbers. Fee Auditor helps you check your own Balance CSV; we are not Stripe support.",
      sections: [{ type: "reasons", items: evalConstLiteral(s, "reasons") }],
      faq: normalizeFaq(evalConstLiteral(s, "faqItems")),
      cta: {
        title: "Find your specific fee driver with Fee Auditor — free",
        description: "Independent tool at feeauditor.com — not affiliated with Stripe. Upload your Balance CSV to see the rate you actually paid and one concrete driver. No OAuth. Raw CSV is not stored.",
        primaryLabel: "Analyze my Balance CSV →",
      },
    };
  }

  {
    const s = readPageSource("what-percent-does-stripe-take");
    seo.whatPercent = {
      metaTitle: extractStringConst(s, "pageTitle"),
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: extractStringConst(s, "pageTitle"),
      eyebrow: "How much does Stripe charge",
      heroTitle: extractStringConst(s, "pageTitle"),
      heroDescription:
        "Short answer: for many US online cards Stripe starts at 2.9% + $0.30 per successful charge (about $3.20 on $100). The real percentage you pay can be higher once small charges, international cards, currency conversion, refunds, and other Stripe fee lines show up.",
      sections: [
        { type: "note", body: "Published list rates only — custom or interchange-plus pricing may differ. Confirm yours in Dashboard → Settings → Plans and fees." },
        { type: "rateCards", heading: "The answer depends on the payment mix", items: evalConstLiteral(s, "commonRates") },
        { type: "formula", heading: "How to calculate the actual percentage", formula: "Real Stripe percentage = total Stripe fees / total processed charge volume", paragraphs: ["For one transaction, divide the Stripe fee by the charge amount. For your business, use the blended rate across a full period.", "That is the number that tells you what Stripe actually took from your revenue. A single $100 domestic card charge may look close to 3.2%, but a real month can land at 3.8%, 4.2%, or higher depending on customer geography and transaction size."] },
        { type: "ctaBlock", title: "Check your real Stripe percentage from CSV", description: "A public calculator can estimate one charge. Your Stripe Balance CSV shows what happened across all charges, refunds, and fee lines. Upload it to see your processing rate, all-in Stripe cost, monthly trend, and top fee drivers.", primaryLabel: "Analyze My Stripe CSV", secondaryLabel: "Open Stripe fees calculator" },
      ],
      faq: normalizeFaq(evalConstLiteral(s, "faqItems")),
      cta: {
        title: "Check your real Stripe percentage from CSV",
        description: "Upload your Balance CSV to see processing rate, all-in cost, monthly trend, and top fee drivers.",
        primaryLabel: "Analyze My Stripe CSV",
      },
    };
  }

  {
    const s = readPageSource("stripe-data-export");
    seo.dataExport = {
      metaTitle: "Stripe Export Paths: CSV vs JSON, Tableau, Postgres | Fee Auditor",
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: extractStringConst(s, "pageTitle"),
      eyebrow: "Stripe data export",
      heroTitle: extractStringConst(s, "pageTitle"),
      heroDescription:
        "The right Stripe export depends on the job. JSON, Tableau, Power BI, and PostgreSQL usually mean an API or data-pipeline workflow. Fee reconciliation is different: use the itemized Stripe Balance CSV so you can see transaction-level fees, refunds, and payout differences.",
      sections: [
        { type: "callout", title: "Quick answer", body: "If you need a database or BI dashboard, use the Stripe API, webhooks, or an ETL connector. If you need to understand why Stripe fees or payouts look wrong, export the itemized Balance CSV and audit the fee rows directly." },
        { type: "table", heading: "Choose the Stripe export path for your goal", headers: ["Goal", "Best path", "Watch out for"], rows: (evalConstLiteral(s, "exportOptions") || []).map((o) => [o.goal, o.bestPath, o.note]) },
        { type: "twoColumn", left: { title: "When you need JSON, BI, or SQL", body: "Use this route when you want ongoing sync, dashboards, joins with product data, or finance reporting across many sources. You will usually care about charges, customers, invoices, subscriptions, refunds, disputes, and payouts." }, right: { title: "When you need your real Stripe rate", body: "Use this route when payout is lower than expected, fees jumped this month, or you want to compare your real effective rate against Stripe's published pricing. Start with the itemized Balance CSV." } },
        { type: "columns", heading: "Columns that matter for Stripe fee analysis", body: "BI exports can include dozens of objects. For a Stripe fee audit, the important part is much smaller: each row needs enough data to separate charge volume from fee dollars.", columns: (evalConstLiteral(s, "feeAuditColumns") || []).map((c) => ({ name: c, description: c })) },
      ],
      faq: normalizeFaq(evalConstLiteral(s, "faqItems")),
      cta: {
        title: "Looking for fee reconciliation?",
        description: "Fee Auditor is not a Tableau, Power BI, JSON, or PostgreSQL connector. It is a focused Stripe Balance CSV auditor: upload the itemized export, see your processing rate, all-in cost, refund leakage, international card drag, and top fee drivers.",
        primaryLabel: "Analyze My Stripe CSV",
      },
    };
  }

  {
    const s = readPageSource("compare-stripe-paypal-wise");
    seo.comparePaypal = {
      metaTitle: `${extractStringConst(s, "pageTitle")} | Fee Auditor`,
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: extractStringConst(s, "pageTitle"),
      eyebrow: "Payment fee comparison",
      heroTitle: "Stripe vs PayPal vs Wise fees: compare the use case first.",
      heroDescription:
        "A single $100-fee calculator is not enough. The real winner depends on card mix, average charge size, international customers, refunds, conversion lift, and whether you are solving checkout or money movement.",
      sections: [
        { type: "heroCard", title: "Find the driver in your existing Stripe data.", body: "If your issue is small charges, international cards, refunds, or card-funded B2B invoices, the fix may be payment mix rather than a full processor migration.", metrics: ["Processing rate", "All-in cost", "Fee drivers"] },
        { type: "platforms", heading: "Which payment option fits which problem?", items: evalConstLiteral(s, "PLATFORMS") },
        { type: "useCaseTable", heading: "Compare by real payment scenario", headers: ["Use case", "Stripe", "PayPal", "Wise"], rows: evalConstLiteral(s, "USE_CASES") },
        { type: "checklist", heading: "Do this before moving payment volume.", items: evalConstLiteral(s, "CHECKLIST") },
      ],
      faq: extractFaqFromStructuredData(s),
      cta: {
        title: "Know your real Stripe baseline before comparing providers.",
        description: "Upload the itemized Stripe Balance CSV and see your actual processing rate, all-in cost, monthly drift, high-fee charges, and savings ideas.",
        primaryLabel: "Analyze my CSV",
      },
    };
  }

  {
    const s = readPageSource("should-i-switch-from-stripe");
    seo.shouldSwitch = {
      metaTitle: `${extractStringConst(s, "pageTitle")} | Fee Auditor`,
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: extractStringConst(s, "pageTitle"),
      eyebrow: "Payment decision guide",
      heroTitle: "Should you switch from Stripe? Audit the fee driver first.",
      heroDescription:
        "If Stripe feels expensive, the answer is not always \"move processors.\" Your best fix may be ACH, annual billing, local payment methods, refund cleanup, or a merchant-of-record platform for tax operations.",
      sections: [
        { type: "heroCard", title: "Switch only after you know why the rate is high.", body: "A 4%+ all-in Stripe cost can mean several different things. The right next step depends on whether the driver is payment method, geography, refunds, disputes, add-ons, or checkout strategy." },
        { type: "decisionTable", heading: "Decision guide: symptom to first move", rows: evalConstLiteral(s, "DECISION_ROWS") },
        { type: "checklist", heading: "A processor switch is the last step, not the first.", body: "You can often get most of the benefit with a smaller change: payment method, plan structure, refund flow, or local checkout option.", items: evalConstLiteral(s, "CHECKLIST") },
        { type: "comparisonLinks", heading: "Compare the right alternative for the problem", items: evalConstLiteral(s, "COMPARISON_LINKS") },
      ],
      faq: extractFaqFromStructuredData(s),
      cta: {
        title: "Your Stripe CSV tells you which alternative is worth testing.",
        description: "Fee Auditor turns the Balance CSV into processing rate, all-in rate, high-fee charges, refund impact, and savings opportunities. Start there before rebuilding checkout.",
        primaryLabel: "Analyze my Stripe CSV",
      },
    };
  }

  {
    const s = readPageSource("stripe-fee-analysis-tools");
    seo.analysisTools = {
      metaTitle: extractStringConst(s, "pageTitle"),
      metaDescription: extractStringConst(s, "pageDescription"),
      breadcrumb: "Stripe fee analysis tools",
      eyebrow: "Tool comparison",
      heroTitle: "Best Stripe fee analysis tools for checking your real effective rate",
      heroDescription:
        "If you only need the published fee for one transaction, a calculator is enough. If you want to know why your actual Stripe rate is higher than expected, you need your itemized Balance CSV and a fee-driver audit.",
      sections: [
        { type: "pillars", items: [{ title: "Before selling", body: "Use a calculator to estimate a future Stripe fee." }, { title: "After selling", body: "Use a Balance CSV to calculate what Stripe actually took." }, { title: "When rates drift", body: "Look for international cards, refunds, small charges, and add-ons." }] },
        { type: "toolsTable", heading: "Which Stripe fee tool fits the job?", items: evalConstLiteral(s, "tools") },
        { type: "whenToUse", useAuditor: ["You already process payments with Stripe and want the actual rate, not a published estimate.", "Your payout looks lower than expected and you want to separate fees from volume.", "You want to inspect international card fees, refund fee leakage, and high-fee charges.", "You prefer CSV-based analysis without Stripe OAuth or API keys."], useOther: ["You need official Stripe policy details. Use Stripe documentation first.", "You need accounting, tax, or bookkeeping advice. Use your accountant or finance system.", "You are building a data warehouse export to Tableau, Qlik, Power BI, PostgreSQL, or JSON.", "You need live transaction sync or payment processing alternatives."] },
      ],
      faq: normalizeFaq(evalConstLiteral(s, "faqItems")),
      cta: {
        title: "Check your actual Stripe rate from a Balance CSV",
        description: "Free preview first. No Stripe OAuth, no API keys, and raw CSV files are not stored as files.",
        primaryLabel: "Analyze My CSV",
      },
    };
  }

  {
    const s = readPageSource("how-it-works");
    seo.howItWorks = {
      metaTitle: "How Stripe Fee Auditor Handles Your CSV",
      metaDescription: "A transparent look at what happens when you upload a Stripe Balance CSV: server analysis, raw file handling, stored report data, retention, and open-source core logic.",
      breadcrumb: "How it works",
      eyebrow: "Data handling",
      heroTitle: "What happens when you upload a Stripe CSV",
      heroDescription:
        "Fee Auditor is intentionally not an OAuth app. You export a Stripe Balance CSV, upload it once, and get a report. The honest version: the CSV does leave your laptop for server-side analysis, but the raw file is not stored as a file, and the stored report is derived from the CSV.",
      sections: [
        { type: "flow", heading: "The upload flow", steps: evalConstLiteral(s, "FLOW") },
        { type: "storage", stored: evalConstLiteral(s, "STORED"), notStored: evalConstLiteral(s, "NOT_STORED") },
        { type: "openSource", heading: "You can inspect how the analysis works", body: "The useful trust signal is transparency: you can see the parser, analyzer, and request flow. The repository is public, including the core CSV and fee logic.", links: evalConstLiteral(s, "CODE_LINKS", { GITHUB_REPO: "https://github.com/Ksantor1981/Stripe-Fee-Auditor" }) },
        { type: "privacy", heading: "Plain-English privacy summary", paragraphs: ["Fee Auditor uses your CSV to produce the report you asked for. It does not sell financial data, does not use it for advertising profiles, and does not connect to your Stripe account.", "Infrastructure providers still exist: Vercel hosts the app, Neon stores derived reports, Polar handles checkout, Resend may send transactional email, and Plausible measures aggregate traffic. The detailed version is in the Privacy Policy.", "If your policy requires fully local processing, use the public code as a reference or wait for a browser-only preview mode. The current production app uses server-side analysis."] },
        { type: "exportGuide", title: "Need the CSV export first?", body: "Use the Stripe Balance CSV guide, then come back and upload the Itemized export.", primaryLabel: "CSV export guide", secondaryLabel: "Upload CSV" },
      ],
      faq: [],
      cta: { title: "Analyze my CSV", description: "Upload your Stripe Balance CSV for a fee audit.", primaryLabel: "Analyze my CSV" },
    };
  }

  {
    const s = readPageSource("monitor");
    seo.monitor = {
      metaTitle: "Fee Monitor — Catch Stripe Rate Drift Before It Becomes Normal",
      metaDescription: "Catch rate drift, refund leakage, and one-off anomalies before they become normal. Monthly CSV reminders — no permanent Stripe OAuth. $9/month.",
      breadcrumb: "Fee Monitor",
      eyebrow: "Fee Monitor · $9/mo",
      heroTitle: "Build a monthly Stripe fee-check habit before drift becomes invisible.",
      heroDescription:
        "$12 = one CSV check (this export, 30 days). $9/mo = a monthly reminder + fresh full report. It is a manual check today; report history and automatic drift alerts come only after they ship. No permanent Stripe OAuth — you stay in control of every export.",
      sections: [
        { type: "pricingCard", price: "$9", period: "/ month", body: "Compared to a one-time $12 investigation: Monitor is for founders who want a reminder to repeat the check. It is not yet automatic monitoring or a historical dashboard.", included: evalConstLiteral(s, "included") },
        { type: "highlights", items: [{ title: "No OAuth first", body: "You stay in control of every CSV export." }, { title: "History", body: "Report history is planned; today, save each private report link." }, { title: "Alerts later", body: "Monthly reminders now; automatic drift alerts later if demand is real." }] },
        { type: "why", heading: "The useful question is not just \"what is my rate?\"", body: "It is \"did my rate get worse, why, and what should I inspect first?\" Today Monitor creates the recurring check-in habit; comparison history and automatic drift detection are future functionality, not a promise already delivered.", steps: [["1", "Upload each month", "Use the same Balance CSV export workflow you already trust."], ["2", "Keep your report links", "Compare the new report with your prior export manually until in-product history ships."], ["3", "Get a monthly nudge", "A reminder brings you back before fee drift becomes invisible."]] },
        { type: "includedNotYet", included: evalConstLiteral(s, "included"), notYet: evalConstLiteral(s, "notYet") },
        { type: "newsletter", title: "Want monthly fee tips before subscribing?", body: "Join the free list if you only want occasional Stripe fee notes and product updates. Subscribe when you want the monthly CSV reminder habit." },
      ],
      faq: [],
      cta: { title: "Start Fee Monitor — $9/mo", description: "Monthly CSV reminder + fresh full report. No permanent Stripe OAuth.", primaryLabel: "Start Fee Monitor — $9/mo" },
    };
  }

  seo.about = {
    metaTitle: "About the Founder & Data Handling | Stripe Fee Auditor",
    metaDescription: "Who built Stripe Fee Auditor, why it exists, and what data we store (and do not store) when you upload a Stripe Balance CSV.",
    breadcrumb: "About",
    eyebrow: "About",
    heroTitle: "About Stripe Fee Auditor",
    heroDescription:
      "Stripe Fee Auditor is an independent tool that helps founders and finance teams understand their real Stripe processing and all-in cost rates from a Balance Transactions CSV — without connecting Stripe OAuth or sharing API keys.",
    sections: [
      { type: "founder", heading: "About the founder", paragraphs: ["Built by Konstantin Starkov, an indie SaaS founder. I built Stripe Fee Auditor after seeing how quickly the real Stripe cost can drift away from the headline 2.9% rate: one sample export showed a 3.82% card processing rate and a 4.02% all-in Stripe cost.", "The product is intentionally narrow: one CSV export, one question, one report that explains whether fees are normal or worth investigating."], links: [{ label: "GitHub", href: "https://github.com/Ksantor1981" }, { label: "Product Hunt", href: "https://www.producthunt.com/products/stripe-fee-auditor?launch=stripe-fee-auditor" }, { label: "Indie Hackers", href: "https://www.indiehackers.com/product/stripe-fee-auditor-2" }] },
      { type: "section", heading: "Why it exists", paragraphs: ["Stripe's advertised 2.9% + $0.30 is only part of the story. International cards, small charges, refunds, disputes, and add-on services push the blended rate higher — often without a clear dashboard view. This tool turns your exported Balance data into a readable audit: processing rate, all-in cost, monthly trends, high-fee charges, and directional savings ideas."] },
      { type: "section", heading: "Privacy & data handling", bullets: ["No Stripe API access. You export CSV from the Stripe Dashboard and upload it once for analysis.", "Raw CSV is not stored as a file. We parse it in memory, compute aggregates, and discard the upload body.", "Computed report JSON (totals, rates, categorized rows) is stored so you can reopen your private link. Customer description fields are redacted before storage.", "USD accounts first. Beta supports USD Balance exports; multi-currency support is on the roadmap."] },
      { type: "section", heading: "Independence", paragraphs: ["Stripe Fee Auditor is not affiliated with Stripe, Inc. We do not receive referral fees from Stripe for recommendations in reports. Action links point to Stripe Dashboard pages so you can verify settings yourself."] },
    ],
    faq: [],
    cta: { title: "Analyze my fees", description: "Upload your Stripe Balance CSV for a fee audit.", primaryLabel: "Analyze my fees →" },
  };

  {
    const ce = JSON.parse(readFile("messages/partials/en/chromeExtension.json")).chromeExtension;
    seo.chromeExtension = {
      metaTitle: ce.metaTitle,
      metaDescription: ce.metaDescription,
      breadcrumb: ce.metaTitle,
      eyebrow: "Chrome helper · free on Web Store",
      heroTitle: ce.heroTitle,
      heroDescription: ce.heroDescription,
      sections: [
        { type: "callout", title: "Available on the Chrome Web Store for everyone.", body: "One-click install. The main product path is still the sample report on feeauditor.com — the helper is a shortcut and monthly nudge, not a second product." },
        { type: "benefits", heading: "What you get after install", items: [ce.feature1Title + ": " + ce.feature1Body, ce.feature2Title + ": " + ce.feature2Body, ce.feature3Title + ": " + ce.feature3Body, "Optional local monthly reminder (no OAuth)", "Does not scrape Stripe pages or request host permissions"] },
        { type: "workflow", heading: ce.featuresHeading, steps: [{ step: "1", title: ce.feature1Title, body: ce.feature1Body }, { step: "2", title: ce.feature2Title, body: ce.feature2Body }, { step: "3", title: ce.feature3Title, body: ce.feature3Body }] },
        { type: "privacy", heading: ce.privacyHeading, items: [ce.privacy1, ce.privacy2, ce.privacy3, ce.privacy4, ce.privacy5] },
        { type: "webApp", heading: ce.webAppHeading, body: ce.webAppBody },
      ],
      faq: [],
      cta: {
        title: ce.finalCtaTitle,
        description: ce.finalCtaBody,
        primaryLabel: ce.installCta,
      },
    };
  }

  for (const [key, file] of [
    ["vsSquare", "scripts/provider-sources/stripe-vs-square-fees.page.tsx"],
    ["vsPaddle", "scripts/provider-sources/stripe-vs-paddle-fees.page.tsx"],
    ["vsGocardless", "scripts/provider-sources/stripe-vs-gocardless.page.tsx"],
  ]) {
    const s = readFile(file);
    const pageTitle = extractStringConst(s, "pageTitle");
    const pagePath = extractStringConst(s, "pagePath");
    const pageDescription = extractStringConst(s, "pageDescription");
    const config = evalConstLiteral(s, "config", { pageTitle, pagePath });
    const page = providerComparisonToSeo(config, pageDescription, extractFaqFromStructuredData(s));
    if (page) seo[key] = page;
    else console.warn("Missing provider config:", key);
  }

  console.log("buildSeoPages done", Object.keys(seo).length);
  return seo;
}

const BLOG_SLUGS = [
  "how-i-found-1400-in-hidden-stripe-fees",
  "cross-border-stripe-fees-migration-2026",
  "stripe-fee-audit-checklist-for-saas-founders",
  "stripe-fee-leakage-report-may-2026",
  "stripe-alternatives-2026",
  "stripe-credit-card-processing-fees",
  "stripe-vs-paypal-fees",
  "stripe-international-card-fees",
  "stripe-ach-vs-credit-card-fees",
  "stripe-fees-small-transactions",
  "stripe-blended-rate-calculator",
  "how-to-export-stripe-balance-csv",
  "why-stripe-effective-rate-jumped-this-month",
  "why-stripe-fees-increase",
  "how-to-reduce-stripe-fees",
  "stripe-effective-fee-rate-explained",
  "why-stripe-effective-rate-higher-than-2-9-percent",
];

function buildBlog() {
  const blog = {};
  console.log("buildBlog start");
  for (const slug of BLOG_SLUGS) {
    process.stdout.write(`  blog: ${slug}\n`);
    const parsed = parseBlogPage(slug);
    if (parsed) blog[slug] = parsed;
    else console.warn("Missing blog:", slug);
  }
  console.log("buildBlog done", Object.keys(blog).length);
  return blog;
}

function buildPrivacy() {
  const privacy = {};
  const source = readFile("app/blog/_data/privacyPosts.ts");
  const start = source.indexOf("export const PRIVACY_ARTICLES");
  const end = source.indexOf("export const PRIVACY_ARTICLE_INDEX");
  const slice = source.slice(start, end);
  const arrStart = slice.indexOf("[");
  const arrEnd = slice.lastIndexOf("]");
  const articles = vm.runInNewContext(`(${slice.slice(arrStart, arrEnd + 1)})`, {}, { timeout: 10000 });
  for (const a of articles || []) {
    privacy[a.slug] = {
      metaTitle: a.title,
      metaDescription: a.description,
      title: a.title,
      shortTitle: a.shortTitle,
      readTime: a.time,
      publishedAt: a.datePublished,
      updatedAt: a.dateModified,
      intro: a.intro,
      sections: a.sections.map((s) => ({
        type: "section",
        heading: s.heading,
        ...(s.paragraphs ? { paragraphs: s.paragraphs } : {}),
        ...(s.bullets ? { bullets: s.bullets } : {}),
        ...(s.table ? { table: s.table } : {}),
      })),
      faq: normalizeBlogFaq(a.faqs),
      sources: a.sources ?? [],
      related: (a.related ?? []).map((r) => ({ href: r.href, title: r.title })),
    };
  }
  console.log("buildPrivacy done", Object.keys(privacy).length);
  return privacy;
}

console.log("extract start");
const blog = buildBlog();
const privacy = buildPrivacy();

const output = {
  seo: buildSeoPages(),
  blog,
  privacy,
};
console.log("extract assembled");

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n", "utf8");

const seoKeys = Object.keys(output.seo);
const blogKeys = Object.keys(output.blog);
const byteSize = Buffer.byteLength(JSON.stringify(output, null, 2) + "\n", "utf8");

console.log("Wrote:", OUT);
console.log("Byte size:", byteSize);
console.log("SEO keys (" + seoKeys.length + "):", seoKeys.join(", "));
console.log("Blog keys (" + blogKeys.length + "):", blogKeys.slice(0, 5).join(", "), "...");
console.log("Privacy keys (" + Object.keys(output.privacy).length + "):", Object.keys(output.privacy).join(", "));
