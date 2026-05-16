export type ArticleSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
};

export type ArticleFaq = {
  question: string;
  answer: string;
};

export type PrivacyArticle = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  time: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
  semanticCluster: string;
  intro: string[];
  sections: ArticleSection[];
  faqs: ArticleFaq[];
  related: { href: string; title: string }[];
  sources: { href: string; title: string }[];
};

export const PRIVACY_ARTICLES: PrivacyArticle[] = [
  {
    slug: "why-i-wont-connect-my-stripe-account-to-third-party-tools",
    title: "Why I Wouldn't Connect My Stripe Account to Every Third-Party Tool",
    shortTitle: "Why I Wouldn't Connect My Stripe Account to Every Tool",
    description:
      "A founder-friendly look at the privacy tradeoff behind Stripe OAuth, read-only access, persistent integrations, and CSV-based fee audits.",
    time: "7 min",
    datePublished: "2026-05-16",
    dateModified: "2026-05-16",
    semanticCluster: "Stripe OAuth risk, Stripe account privacy, no-OAuth Stripe fee audit",
    keywords: [
      "connect Stripe account to third party tools",
      "Stripe OAuth risk",
      "Stripe read only access",
      "audit Stripe fees without OAuth",
      "Stripe CSV fee analysis",
      "Stripe account privacy",
    ],
    intro: [
      "Connecting a tool to Stripe is easy. One OAuth screen, one click, and suddenly the tool can start building charts, dashboards, alerts, and forecasts from your payment data.",
      "That convenience is real. But so is the tradeoff. Your Stripe account contains customer records, payments, refunds, invoices, payouts, disputes, and a history of how money moves through your business. Even read access can be a bigger trust decision than it sounds.",
      "This is why I prefer a CSV-first workflow for one-off fee audits: export the data I need, analyze that snapshot, and avoid granting a persistent connection to my live Stripe account.",
    ],
    sections: [
      {
        heading: "The problem is not that OAuth is bad",
        paragraphs: [
          "OAuth is a legitimate way to connect software. If you need a live subscription dashboard, automated revenue recognition, or recurring operational syncs, an API connection can make sense.",
          "The problem is that many founders treat a Stripe OAuth prompt like a harmless login button. It is not. It is a permission decision around some of the most sensitive operating data in the business.",
        ],
      },
      {
        heading: "What broad read access can expose",
        paragraphs: [
          "Stripe has more than one integration model, including Connect OAuth, Stripe Apps permissions, and API keys. The exact data depends on the model and permissions granted. But broad read access can expose categories like these:",
        ],
        bullets: [
          "Customer records such as names, email addresses, billing details, and tax identifiers when customer access is granted.",
          "Charges, refunds, payment attempts, invoices, subscriptions, prices, coupons, and billing history.",
          "Balance transactions, fee records, transfers, payouts, and cash movement through the Stripe account.",
          "Disputes, fraud warnings, events, files, and other operational records depending on requested permissions.",
        ],
      },
      {
        heading: "Read-only still means copyable data",
        paragraphs: [
          "Read-only normally means the tool should not create refunds, update subscriptions, or change your Stripe settings. That is good. But read-only data can still be copied, processed, stored, exported, joined with other datasets, and exposed if the vendor is breached.",
          "In other words, the important question is not only 'Can this app change my account?' It is also 'What can this app learn about my customers and business, and how long will it keep that data?'",
        ],
      },
      {
        heading: "Persistent access is the hidden part",
        paragraphs: [
          "A CSV export is a snapshot. An OAuth or API connection can be ongoing until it is revoked or otherwise limited by the integration. If you stop using a tool but forget to disconnect it, that connection may remain part of your security surface.",
          "That does not mean every connected tool is unsafe. It means every connection deserves the same scrutiny you would give any vendor that handles customer or financial data.",
        ],
      },
      {
        heading: "The CSV-first alternative",
        paragraphs: [
          "For a fee audit, real-time access is usually unnecessary. You do not need a permanent connection to answer questions like: What is my effective fee rate? Which transactions are expensive? Are refunds leaking margin? Is my 4.5% rate normal for my mix?",
          "Fee Auditor uses this approach. You export an itemized Stripe Balance Transactions CSV, upload it for analysis, and get a report without connecting your Stripe account. The raw CSV is not stored as a raw file; the app keeps a temporary derived report so you can reopen the results.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is connecting a Stripe tool always unsafe?",
        answer:
          "No. API tools can be valuable when you need real-time dashboards or automation. The point is to treat Stripe access as a vendor trust decision, not a casual login step.",
      },
      {
        question: "Why is CSV enough for a fee audit?",
        answer:
          "A fee audit is usually retrospective. An itemized Balance Transactions CSV contains the amounts, fees, types, currencies, and timestamps needed to calculate your effective fee rate and find expensive transactions.",
      },
    ],
    related: [
      { href: "/blog/what-does-stripe-oauth-read-only-access-actually-see", title: "What does Stripe OAuth read-only access actually see?" },
      { href: "/blog/how-to-audit-stripe-fees-without-connecting-your-account", title: "How to audit Stripe fees without connecting your account" },
      { href: "/blog/csv-vs-api-stripe-fee-analysis", title: "CSV vs API for Stripe fee analysis" },
    ],
    sources: [
      { href: "https://docs.stripe.com/connect/oauth-reference", title: "Stripe Connect OAuth reference" },
      { href: "https://docs.stripe.com/stripe-apps/reference/permissions", title: "Stripe Apps permissions reference" },
    ],
  },
  {
    slug: "what-does-stripe-oauth-read-only-access-actually-see",
    title: "What Does Stripe OAuth Read-Only Access Actually See?",
    shortTitle: "What Stripe Read-Only Access Can See",
    description:
      "A technical but practical breakdown of Stripe read-only access, Stripe Apps permissions, API keys, customer data, payments, payouts, refunds, and disputes.",
    time: "8 min",
    datePublished: "2026-05-16",
    dateModified: "2026-05-16",
    semanticCluster: "Stripe OAuth read-only scope, Stripe Apps permissions, Stripe data access",
    keywords: [
      "Stripe OAuth read only access",
      "what data can Stripe OAuth see",
      "Stripe Apps permissions",
      "Stripe customer_read charge_read payout_read",
      "Stripe third party app access",
      "Stripe data privacy",
    ],
    intro: [
      "The phrase read-only sounds safe. It suggests a third-party app can look at your Stripe data but cannot change anything. That distinction matters, but it does not mean the data exposure is small.",
      "Stripe integrations can work through Connect OAuth, Stripe Apps permissions, restricted API keys, or custom API integrations. The exact access depends on the integration model and the permissions granted. Still, broad read access can reveal much more than a few payment totals.",
    ],
    sections: [
      {
        heading: "First, separate the access models",
        table: {
          headers: ["Model", "What it means", "Why founders should care"],
          rows: [
            ["Connect OAuth", "A connected app receives access according to the OAuth flow and selected scope.", "Useful for third-party services, but access can persist until revoked."],
            ["Stripe Apps", "Apps declare granular permissions such as customer_read, charge_read, payout_read, and event_read.", "The permission list shows the kind of data categories an app may request."],
            ["API keys", "A business or developer creates keys for direct API access, sometimes restricted.", "Powerful, but dangerous if keys are overbroad or leaked."],
          ],
        },
      },
      {
        heading: "Data categories broad read access can include",
        paragraphs: [
          "Not every tool requests every category. A responsible integration should ask for only what it needs. But when evaluating a tool, these are the categories worth checking on the consent screen, app manifest, documentation, and privacy policy.",
        ],
        table: {
          headers: ["Category", "Examples", "Why it matters"],
          rows: [
            ["Customers", "Names, emails, billing details, customer metadata", "This can identify who buys from you and how valuable they are."],
            ["Payments", "Charges, refunds, payment intents, invoices", "This reveals revenue history and transaction-level behavior."],
            ["Balance and payouts", "Balance transactions, transfers, payout timing", "This shows cash movement and operational finance data."],
            ["Subscriptions", "Plans, prices, coupons, renewal status", "This exposes your pricing model and customer lifecycle."],
            ["Risk and disputes", "Disputes, chargebacks, fraud warnings", "This can reveal operational weaknesses and customer conflicts."],
            ["Events and files", "Account events, uploaded files depending on permissions", "This can broaden the data footprint beyond payments."],
          ],
        },
      },
      {
        heading: "What read-only usually cannot do",
        paragraphs: [
          "Read-only access should not let an app issue refunds, update subscriptions, create payouts, change account settings, or modify live objects. That is an important protection.",
          "But it can still let a vendor read and process sensitive business data. The risk is data exposure, vendor storage, breach impact, and long-lived access - not necessarily unauthorized writes.",
        ],
      },
      {
        heading: "Questions to ask before granting access",
        bullets: [
          "Which exact Stripe permissions or scopes does the tool request?",
          "Does it need live access, or would an exported CSV answer the question?",
          "Does it store customer-level data, transaction-level data, or only aggregated metrics?",
          "How do I revoke access, and what happens to stored historical data after revocation?",
          "Is there a clear privacy policy, security page, and data retention explanation?",
        ],
      },
      {
        heading: "How Fee Auditor avoids this class of access",
        paragraphs: [
          "Fee Auditor does not ask you to connect Stripe. It analyzes an itemized Stripe Balance Transactions CSV. That means it cannot keep polling your Stripe account, cannot read new customer activity after the export, and cannot change anything in Stripe.",
          "For a periodic fee audit, this is usually enough: the Balance CSV contains the charge amount, fee, net amount, currency, type, and timestamp needed to calculate the real effective fee rate.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does read-only access include card numbers?",
        answer:
          "Stripe does not expose raw card numbers through normal API access. However, read access can still expose customer, payment, subscription, refund, payout, and dispute records depending on the integration permissions.",
      },
      {
        question: "Can I revoke Stripe app access later?",
        answer:
          "Yes, connected apps can generally be reviewed and revoked from the Stripe Dashboard. Revocation stops future access, but you should still check each vendor's policy for data already stored.",
      },
    ],
    related: [
      { href: "/blog/why-i-wont-connect-my-stripe-account-to-third-party-tools", title: "Why I would not connect my Stripe account to every tool" },
      { href: "/blog/the-stripe-data-you-share-with-analytics-tools", title: "The Stripe data you share with analytics tools" },
      { href: "/blog/csv-vs-api-stripe-fee-analysis", title: "CSV vs API for Stripe fee analysis" },
    ],
    sources: [
      { href: "https://docs.stripe.com/connect/oauth-reference", title: "Stripe Connect OAuth reference" },
      { href: "https://docs.stripe.com/stripe-apps/reference/permissions", title: "Stripe Apps permissions reference" },
    ],
  },
  {
    slug: "how-to-audit-stripe-fees-without-connecting-your-account",
    title: "How to Audit Your Stripe Fees Without Connecting Your Account",
    shortTitle: "Audit Stripe Fees Without Connecting Your Account",
    description:
      "A practical guide to auditing Stripe fees from an itemized Balance Transactions CSV: blended rate formula, fee drivers, refunds, anomalies, and no-OAuth analysis.",
    time: "9 min",
    datePublished: "2026-05-16",
    dateModified: "2026-05-16",
    semanticCluster: "Stripe fee audit, Balance Transactions CSV, blended fee rate calculator",
    keywords: [
      "audit Stripe fees without connecting account",
      "Stripe Balance Transactions CSV",
      "Stripe effective fee rate formula",
      "Stripe blended rate calculation",
      "Stripe fee audit CSV",
      "Stripe refund fee tracking",
    ],
    intro: [
      "If you only look at Stripe's headline card rate, it is easy to assume your cost is roughly 2.9% plus 30 cents. The real number can be higher once your actual customer mix shows up: international cards, small charges, refunds, disputes, Radar, and currency-related costs.",
      "You do not need to connect your Stripe account to understand this. You can audit fees from an itemized Balance Transactions CSV and calculate your real effective fee rate from the data Stripe already gives you.",
    ],
    sections: [
      {
        heading: "Step 1: export the right Stripe CSV",
        paragraphs: [
          "Use the itemized Balance Transactions export, not a payout summary. In Stripe Dashboard, go to Reports, open Balance transactions, choose the period you want to audit, and export the itemized CSV.",
          "For a meaningful report, use at least three months of data if possible. For anomaly detection and trend analysis, six to twelve months is better.",
        ],
      },
      {
        heading: "Step 2: confirm the required columns",
        paragraphs: ["For a basic fee audit, you need transaction-level rows with the core columns Fee Auditor also expects:"],
        bullets: [
          "id - the Stripe balance transaction identifier.",
          "type - for example charge, refund, payout, fee, or adjustment.",
          "amount - gross amount, usually stored in the smallest currency unit in the CSV.",
          "fee - the fee associated with the row.",
          "net - amount after fees.",
          "currency - for example usd.",
          "created - timestamp or date.",
          "description - optional, but helpful for classifying international cards and other context.",
        ],
      },
      {
        heading: "Step 3: calculate your effective fee rate",
        paragraphs: ["The cleanest fee-rate calculation is based on charge rows, because that compares card processing fees to processed charge volume for the same set of transactions."],
        table: {
          headers: ["Metric", "How to calculate it"],
          rows: [
            ["Charge volume", "Filter type = charge, then sum amount."],
            ["Charge fees", "On those same charge rows, sum fee."],
            ["Effective fee rate", "Charge fees divided by charge volume, multiplied by 100."],
            ["Other fees", "Sum fee on non-charge rows separately so disputes, adjustments, and add-ons do not hide inside the card rate."],
          ],
        },
      },
      {
        heading: "Step 4: find what is pushing the rate up",
        bullets: [
          "International and cross-border cards can add a meaningful surcharge to otherwise normal charges.",
          "Small transactions can have a very high effective rate because the fixed 30 cent fee dominates the payment.",
          "Large B2B card invoices may be cheaper through ACH or bank transfer if customers are willing to use it.",
          "Refunds can leak margin because Stripe generally does not return the original processing fee.",
          "One-off high-fee transactions can reveal card mix, disputes, Radar, or classification issues worth reviewing.",
        ],
      },
      {
        heading: "Step 5: benchmark the result",
        paragraphs: [
          "A 4.5% effective rate is not automatically good or bad. It depends on your mix. A US-only SaaS business with larger domestic card payments should usually look different from a global business selling low-ticket subscriptions to customers across many countries.",
          "That is why a useful report should not only say 'your rate is 4.5%.' It should answer: is this normal for this mix, what is driving it, and what should I look at first?",
        ],
      },
      {
        heading: "How Fee Auditor automates the audit",
        paragraphs: [
          "Fee Auditor follows the CSV approach. You export the itemized Balance Transactions CSV, upload it, and get a report showing real effective fee rate, benchmark verdict, top fee drivers, refund leakage, anomalies, monthly trends, and savings opportunities.",
          "It does not connect to your Stripe account or request OAuth access. The raw CSV is parsed for analysis and not stored as a raw file; a temporary derived report is retained so you can reopen your result.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I calculate Stripe fees manually from CSV?",
        answer:
          "Yes. Filter charge rows, sum amount, sum fee on those same rows, then divide fees by volume. For deeper analysis, group by month, transaction size, refund rows, and high-fee outliers.",
      },
      {
        question: "Do I need to connect my Stripe account to use Fee Auditor?",
        answer: "No. Fee Auditor uses an exported Stripe Balance Transactions CSV. It does not request Stripe OAuth or API access.",
      },
    ],
    related: [
      { href: "/stripe-balance-csv", title: "Step-by-step Stripe Balance CSV export guide" },
      { href: "/blog/stripe-blended-rate-calculator", title: "Stripe blended rate calculator" },
      { href: "/blog/stripe-fees-small-transactions", title: "Stripe fees for small transactions" },
    ],
    sources: [
      { href: "https://docs.stripe.com/reports", title: "Stripe reports documentation" },
      { href: "https://docs.stripe.com/connect/oauth-reference", title: "Stripe Connect OAuth reference" },
    ],
  },
  {
    slug: "the-stripe-data-you-share-with-analytics-tools",
    title: "The Stripe Data You're Sharing With Every Analytics Tool You Connect",
    shortTitle: "The Stripe Data You Share With Analytics Tools",
    description:
      "A practical checklist for founders connecting Stripe analytics tools: customer data, payments, subscriptions, payouts, disputes, privacy policies, retention, and alternatives.",
    time: "8 min",
    datePublished: "2026-05-16",
    dateModified: "2026-05-16",
    semanticCluster: "Stripe analytics tools data sharing, customer data, payment data privacy",
    keywords: [
      "Stripe analytics tool data sharing",
      "connect Stripe to analytics tool",
      "Baremetrics ChartMogul Stripe data",
      "Stripe customer data privacy",
      "Stripe payment data exposure",
      "Stripe vendor risk",
    ],
    intro: [
      "Founders connect Stripe to analytics tools for good reasons: MRR, churn, cohorts, failed payments, revenue forecasting, and customer segmentation. Those insights can be valuable.",
      "But each connection also creates a data-sharing relationship. Depending on the tool and permissions, you may be sharing customer records, transactions, invoices, subscriptions, refunds, payout history, and dispute data. That is not automatically wrong, but it should be intentional.",
    ],
    sections: [
      {
        heading: "What analytics tools often need",
        paragraphs: ["Revenue analytics tools usually need more than a single total. To calculate MRR, churn, customer lifetime value, refunds, expansion revenue, and cohorts, they need transaction-level and customer-level context."],
        bullets: [
          "Customer identifiers and contact fields for account-level reporting.",
          "Subscriptions, prices, invoices, coupons, and invoice status for recurring revenue metrics.",
          "Charges, refunds, disputes, and payment failures for revenue and risk reporting.",
          "Balance transactions and payouts for reconciliation and cash flow views.",
        ],
      },
      {
        heading: "The cumulative risk of many connections",
        paragraphs: [
          "One trusted tool may be reasonable. Five tools with overlapping Stripe access are a larger surface area. Each vendor has its own infrastructure, employees, logs, backups, subprocessors, and data retention policy.",
          "This is why the question is not 'Are analytics tools bad?' The better question is 'Which tools need live access, which only need snapshots, and which should be removed?'",
        ],
      },
      {
        heading: "A founder checklist before clicking connect",
        bullets: [
          "What exact Stripe data does the tool need to deliver the feature I want?",
          "Can I get the answer from a CSV export instead of live API access?",
          "Does the vendor store raw transaction-level data or only derived metrics?",
          "How long is the data retained after I disconnect?",
          "Can I revoke access easily from Stripe Dashboard?",
          "Does the privacy policy mention subprocessors, breach handling, and data deletion?",
        ],
      },
      {
        heading: "When live analytics are worth it",
        paragraphs: ["If you run a mature subscription business and need daily metrics, lifecycle automation, or real-time alerts, a connected analytics platform may be the right tradeoff. The point is not to avoid every integration. The point is to match the access level to the job."],
      },
      {
        heading: "When a CSV audit is enough",
        paragraphs: [
          "If the question is periodic and retrospective - for example, 'What was my real Stripe fee rate last quarter?' - a CSV export is often enough. You can analyze the exact period you care about without granting a vendor ongoing access to your Stripe account.",
          "Fee Auditor is built for that use case. It is not trying to replace live subscription analytics. It is a focused audit tool for Stripe fee visibility, benchmark context, refund fee leakage, and transaction-level fee drivers.",
        ],
      },
    ],
    faqs: [
      {
        question: "Should I avoid tools like Baremetrics or ChartMogul?",
        answer:
          "Not necessarily. They solve real revenue analytics problems. The point is to understand what data you share, why the tool needs it, and whether a lower-access workflow would be enough for the specific task.",
      },
      {
        question: "What is a lower-access way to analyze Stripe fees?",
        answer: "Export an itemized Stripe Balance Transactions CSV and analyze that snapshot. This avoids persistent Stripe account access while still giving enough data for fee-rate analysis.",
      },
    ],
    related: [
      { href: "/blog/why-i-wont-connect-my-stripe-account-to-third-party-tools", title: "Why I would not connect my Stripe account to every tool" },
      { href: "/blog/what-does-stripe-oauth-read-only-access-actually-see", title: "What Stripe read-only access can see" },
      { href: "/blog/how-to-audit-stripe-fees-without-connecting-your-account", title: "Audit Stripe fees without connecting your account" },
    ],
    sources: [
      { href: "https://docs.stripe.com/stripe-apps/reference/permissions", title: "Stripe Apps permissions reference" },
      { href: "https://docs.stripe.com/connect/oauth-reference", title: "Stripe Connect OAuth reference" },
    ],
  },
  {
    slug: "csv-vs-api-stripe-fee-analysis",
    title: "CSV vs API: Two Ways to Analyze Stripe Fees, and When Each Makes Sense",
    shortTitle: "CSV vs API for Stripe Fee Analysis",
    description:
      "A balanced comparison of CSV exports and Stripe API integrations for fee analysis, including privacy, automation, accuracy, benchmarks, and when to use each approach.",
    time: "8 min",
    datePublished: "2026-05-16",
    dateModified: "2026-05-16",
    semanticCluster: "Stripe CSV vs API, Stripe fee analysis, no-OAuth fee audit",
    keywords: [
      "CSV vs API Stripe fees",
      "Stripe fee analysis API",
      "Stripe Balance CSV analysis",
      "Stripe fee audit without OAuth",
      "Stripe API privacy",
      "Stripe effective fee rate CSV",
    ],
    intro: [
      "There are two honest ways to analyze Stripe fees: connect to the API, or export CSV data and analyze a snapshot. Neither is universally better. They optimize for different things.",
      "The API approach wins when you need automation and live dashboards. The CSV approach wins when you need a focused audit, a lower-access workflow, and a clear answer without maintaining a persistent connection to Stripe.",
    ],
    sections: [
      {
        heading: "Quick comparison",
        table: {
          headers: ["Question", "CSV approach", "API approach"],
          rows: [
            ["Needs live Stripe access?", "No", "Yes"],
            ["Best for", "Monthly or quarterly fee audits", "Continuous dashboards and automation"],
            ["Setup effort", "Export and upload a file", "Connect app or build integration"],
            ["Privacy surface", "Snapshot of selected period", "Persistent account access depending on permissions"],
            ["Real-time reporting", "No", "Yes"],
            ["Good for benchmark and fee leakage", "Yes", "Yes, if implemented carefully"],
          ],
        },
      },
      {
        heading: "When the API makes sense",
        bullets: [
          "You need daily or real-time dashboards for revenue, churn, failed payments, or subscriptions.",
          "You need alerts and automation that react to Stripe events.",
          "You have an internal team that can manage least-privilege access, logging, deletion, and vendor review.",
          "You are comfortable with a third-party service having ongoing access to the Stripe data it needs.",
        ],
      },
      {
        heading: "When CSV makes sense",
        bullets: [
          "You want to answer a periodic question like 'What was my real effective fee rate last quarter?'",
          "You do not want to connect your live Stripe account to another vendor.",
          "You only need a selected time period, not ongoing polling.",
          "You want a file-based workflow you can explain to finance, operations, or a cofounder.",
        ],
      },
      {
        heading: "Accuracy depends on the source data",
        paragraphs: [
          "For fee analysis, the itemized Balance Transactions CSV is a strong source because it contains transaction-level amounts, fees, net amounts, types, currencies, and timestamps. That is enough to calculate charge fee rate, other fees, monthly trends, top drivers, and refund fee impact.",
          "An API integration can access similar or richer data, but it still has to make the same modeling decisions: which rows count as charge volume, which fees are separate, how refunds are treated, and how to classify anomalies.",
        ],
      },
      {
        heading: "Why Fee Auditor uses CSV first",
        paragraphs: [
          "Fee Auditor is built for one job: help founders understand their actual Stripe fees without granting account access. For that job, CSV is the right starting point. It is explicit, limited to the exported period, and easy to revoke because there is no connection to revoke.",
          "The result is not a live revenue analytics suite. It is a focused fee audit: real effective rate, benchmark verdict, refund leakage, top fee drivers, anomalies, monthly trends, and savings opportunities from your exported Balance data.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is CSV less accurate than the Stripe API?",
        answer:
          "Not necessarily. For retrospective fee analysis, an itemized Balance Transactions CSV can contain the exact fields needed. API access is more useful when you need live or automated reporting.",
      },
      {
        question: "Can Fee Auditor replace a subscription analytics platform?",
        answer:
          "No. Fee Auditor is focused on Stripe fee analysis, not full revenue analytics. It is designed for audits, benchmarks, refund leakage, and fee-driver visibility from CSV exports.",
      },
    ],
    related: [
      { href: "/blog/how-to-audit-stripe-fees-without-connecting-your-account", title: "How to audit Stripe fees without connecting your account" },
      { href: "/stripe-fee-calculator", title: "Stripe effective fee rate calculator" },
      { href: "/analyze?sample=1", title: "Try a sample Fee Auditor report" },
    ],
    sources: [
      { href: "https://docs.stripe.com/reports", title: "Stripe reports documentation" },
      { href: "https://docs.stripe.com/connect/oauth-reference", title: "Stripe Connect OAuth reference" },
    ],
  },
];

export const PRIVACY_ARTICLE_INDEX = PRIVACY_ARTICLES.map(({ slug, shortTitle, description, time }) => ({
  slug,
  title: shortTitle,
  desc: description,
  time,
}));

export const PRIVACY_ARTICLE_SLUGS = PRIVACY_ARTICLES.map((post) => post.slug);

export function getPrivacyArticle(slug: string): PrivacyArticle | undefined {
  return PRIVACY_ARTICLES.find((post) => post.slug === slug);
}
