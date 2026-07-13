import type { Metadata } from "next";
import { ProviderComparisonPage, type ProviderComparisonConfig } from "@/components/ProviderComparisonPage";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe vs Square Fees: Compare Before Switching";
const pageDescription =
  "Compare Stripe and Square by use case: SaaS checkout, in-person payments, invoices, low-ticket charges, and what to audit before switching.";
const pagePath = "/stripe-vs-square-fees";
const updatedAt = "2026-07-13";
const ogImage = buildOgImageUrl({ title: "Stripe vs Square fees", eyebrow: "Payment comparison" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  keywords: [
    "Stripe vs Square fees",
    "Square vs Stripe fees",
    "Stripe alternatives",
    "payment processor comparison",
    "Stripe fee audit",
  ],
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl(pagePath),
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

const config: ProviderComparisonConfig = {
  pageTitle,
  pagePath,
  eyebrow: "Stripe vs Square",
  h1: "Stripe vs Square fees: compare the business model before switching.",
  intro:
    "Stripe and Square can both process payments, but they often fit different jobs. Stripe is strong for online SaaS and custom checkout. Square is often strongest when in-person payments, POS, appointments, or local services matter.",
  alternativeName: "Square",
  heroTitle: "Square is not just a cheaper Stripe.",
  heroBody:
    "If your Stripe issue is international cards, refunds, or small subscription charges, switching to Square may not fix the root cause. First measure what is driving your actual Stripe rate.",
  scenarios: [
    {
      useCase: "SaaS subscriptions",
      stripe: "Usually the default for subscription logic, invoices, APIs, and custom checkout flows.",
      alternative: "Can work for simpler online payments, but it is usually less SaaS-native than Stripe.",
      decision: "Audit Stripe first; if fees are high because of card mix, change payment methods before moving platforms.",
    },
    {
      useCase: "In-person services",
      stripe: "Works online, but may not be the simplest option for POS-first businesses.",
      alternative: "Often a stronger fit for card readers, POS, appointments, and local-service workflows.",
      decision: "If most payments happen in person, compare checkout workflow as much as fee rate.",
    },
    {
      useCase: "Low-ticket charges",
      stripe: "Fixed per-charge fees can dominate small transactions and push the effective rate up.",
      alternative: "Also has per-transaction economics; low-ticket math still needs to be checked.",
      decision: "Try bundling, minimum charges, or monthly invoices before assuming the processor is the problem.",
    },
    {
      useCase: "International online customers",
      stripe: "International cards, currency conversion, and card mix can push real cost above headline pricing.",
      alternative: "May be less relevant if the core problem is cross-border online SaaS checkout.",
      decision: "Inspect international card share and local payment method options first.",
    },
    {
      useCase: "Retail plus online",
      stripe: "Strong online stack, but POS tooling may need extra setup.",
      alternative: "Often attractive for unified POS, inventory, and local-business workflows.",
      decision: "Choose based on operations and reconciliation, not only published processing fees.",
    },
  ],
  goodFit: [
    {
      title: "You sell in person",
      body: "POS hardware, staff workflows, and local-service payments are part of the buying decision.",
    },
    {
      title: "You want simpler local operations",
      body: "Appointments, card readers, inventory, and simple online payments can matter more than developer flexibility.",
    },
    {
      title: "Your team is not technical",
      body: "Square may be easier for local businesses that do not want to build custom payment flows.",
    },
  ],
  badFit: [
    {
      title: "Your issue is card mix",
      body: "International cards, refunds, and small charges can follow you to any card processor.",
    },
    {
      title: "You need complex SaaS billing",
      body: "Subscriptions, upgrades, invoices, trials, and API-heavy flows may still favor Stripe.",
    },
    {
      title: "You have not measured the real driver",
      body: "A lower headline rate does not help if the leak is refunds, disputes, or transaction size.",
    },
  ],
  checklist: [
    "Export the itemized Stripe Balance CSV for the last 3-6 months.",
    "Check processing rate vs all-in Stripe cost.",
    "Measure how much comes from international cards, refunds, disputes, and small charges.",
    "Compare Square only against the specific driver you found.",
    "If most payments are in person, compare POS workflow and reconciliation too.",
  ],
  officialSources: [
    { title: "Stripe pricing", href: "https://stripe.com/pricing" },
    { title: "Square processing fees", href: "https://squareup.com/us/en/payments/our-fees" },
  ],
  related: [
    { title: "Should I switch from Stripe?", href: "/should-i-switch-from-stripe" },
    { title: "Stripe alternatives in 2026", href: "/blog/stripe-alternatives-2026" },
    { title: "Stripe fee calculator", href: "/stripe-fee-calculator" },
    { title: "How to reduce Stripe fees", href: "/blog/how-to-reduce-stripe-fees" },
  ],
  ctaCampaign: "stripe_vs_square",
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    headline: pageTitle,
    description: pageDescription,
    datePublished: updatedAt,
    dateModified: updatedAt,
    author: { "@type": "Person", name: "Konstantin Starkov" },
    publisher: { "@type": "Organization", name: "Stripe Fee Auditor", url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(pagePath),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Square cheaper than Stripe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not universally. The answer depends on country, payment method, transaction size, card mix, refunds, in-person needs, and the product tier you use.",
        },
      },
      {
        "@type": "Question",
        name: "Should a SaaS business switch from Stripe to Square?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Usually only after auditing the actual Stripe fee driver. For SaaS subscriptions, changing billing model, ACH, local payment methods, or pricing may solve the issue before a full processor switch.",
        },
      },
    ],
  },
];

export default function StripeVsSquareFeesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <ProviderComparisonPage config={config} />
    </>
  );
}
