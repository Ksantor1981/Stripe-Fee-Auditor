import type { Metadata } from "next";
import { ProviderComparisonPage, type ProviderComparisonConfig } from "@/components/ProviderComparisonPage";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe vs Paddle Fees: Processor vs Merchant of Record";
const pageDescription =
  "Compare Stripe and Paddle for SaaS: payment processing, merchant-of-record tax handling, international sales, checkout control, and what to audit before switching.";
const pagePath = "/stripe-vs-paddle-fees";
const updatedAt = "2026-07-13";
const ogImage = buildOgImageUrl({ title: "Stripe vs Paddle fees", eyebrow: "SaaS payments" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  keywords: [
    "Stripe vs Paddle fees",
    "Paddle vs Stripe",
    "merchant of record fees",
    "SaaS payment fees",
    "Stripe alternatives for SaaS",
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
  eyebrow: "Stripe vs Paddle",
  h1: "Stripe vs Paddle fees: compare payment processing against merchant-of-record coverage.",
  intro:
    "Paddle is not just another processor. It can act as merchant of record, which changes tax, compliance, checkout, chargebacks, and reporting. That can be worth it for some SaaS teams, but it is not automatically cheaper than Stripe.",
  alternativeName: "Paddle",
  heroTitle: "MoR value is about operations, not only fee rate.",
  heroBody:
    "If your Stripe problem is tax complexity, international compliance, or merchant-of-record needs, Paddle may be relevant. If your problem is card mix or small charges, audit the Stripe fee driver first.",
  scenarios: [
    {
      useCase: "Global SaaS tax handling",
      stripe: "You keep more checkout control, but tax/compliance setup may need extra tools and operations.",
      alternative: "Merchant-of-record model can handle more tax and compliance workflow for supported regions.",
      decision: "If tax ops are the pain, compare total operational cost, not just processing rate.",
    },
    {
      useCase: "Simple SaaS subscriptions",
      stripe: "Strong developer control, broad integrations, and flexible subscription logic.",
      alternative: "Can simplify billing ops, but may reduce checkout/control flexibility.",
      decision: "Use Paddle when operational simplification outweighs platform flexibility.",
    },
    {
      useCase: "High international card share",
      stripe: "International cards and FX can push effective rate above published domestic pricing.",
      alternative: "May help with localized payment experience, but total MoR pricing still needs checking.",
      decision: "Measure international uplift first; local methods may be enough without a full MoR switch.",
    },
    {
      useCase: "Low-ticket plans",
      stripe: "Fixed fees and add-ons can make low-ticket subscriptions expensive.",
      alternative: "MoR pricing can also be heavy for low-ticket plans.",
      decision: "Try annual billing, bundling, or minimum plan changes before migrating.",
    },
    {
      useCase: "Custom checkout and marketplace logic",
      stripe: "Usually stronger for custom flows, platform payments, and deeply integrated checkout.",
      alternative: "Better when you want a packaged SaaS commerce layer, not maximum checkout control.",
      decision: "Do not trade away product flexibility unless the operations benefit is clear.",
    },
  ],
  goodFit: [
    {
      title: "Tax and compliance are the real bottleneck",
      body: "Merchant-of-record value is strongest when global sales operations are eating founder or finance time.",
    },
    {
      title: "You want a SaaS commerce layer",
      body: "Billing, checkout, tax, subscriptions, and merchant operations can be bundled into one workflow.",
    },
    {
      title: "You sell internationally",
      body: "Localization and MoR handling may matter more than shaving a small percentage from processing.",
    },
  ],
  badFit: [
    {
      title: "You only want lower card fees",
      body: "A MoR platform can cost more on paper; compare total value, not just Stripe's processing rate.",
    },
    {
      title: "Your checkout needs deep control",
      body: "Stripe may remain better if custom flows, marketplace logic, or billing edge cases are core to the product.",
    },
    {
      title: "Your CSV shows simple fixes",
      body: "International uplift, annual billing, ACH, and refund cleanup may solve the issue without changing platforms.",
    },
  ],
  checklist: [
    "Audit current Stripe processing rate and all-in cost.",
    "Separate payment-fee pain from tax/compliance/operations pain.",
    "Estimate the value of MoR coverage in hours saved and risk reduced.",
    "Check whether local payment methods or plan changes solve the fee driver first.",
    "Compare official Stripe and Paddle pricing for your country, product, and volume.",
  ],
  officialSources: [
    { title: "Stripe pricing", href: "https://stripe.com/pricing" },
    { title: "Paddle pricing", href: "https://www.paddle.com/pricing" },
  ],
  related: [
    { title: "Should I switch from Stripe?", href: "/should-i-switch-from-stripe" },
    { title: "Stripe alternatives in 2026", href: "/blog/stripe-alternatives-2026" },
    { title: "Stripe vs PayPal vs Wise fees", href: "/compare-stripe-paypal-wise" },
    { title: "How I found $1,400 in hidden Stripe fee opportunities", href: "/blog/how-i-found-1400-in-hidden-stripe-fees" },
  ],
  ctaCampaign: "stripe_vs_paddle",
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
        name: "Is Paddle cheaper than Stripe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not necessarily. Paddle's merchant-of-record model can include operational and compliance value, so compare total cost and value rather than card processing rate alone.",
        },
      },
      {
        "@type": "Question",
        name: "When should SaaS consider Paddle instead of Stripe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Paddle may make sense when tax, compliance, international SaaS sales, and merchant-of-record operations matter more than maximum checkout control.",
        },
      },
    ],
  },
];

export default function StripeVsPaddleFeesPage() {
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
