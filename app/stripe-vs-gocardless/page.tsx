import type { Metadata } from "next";
import { ProviderComparisonPage, type ProviderComparisonConfig } from "@/components/ProviderComparisonPage";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe vs GoCardless: Card Fees vs Bank Debit";
const pageDescription =
  "Compare Stripe and GoCardless for recurring payments, ACH, SEPA, B2B invoices, card checkout, and when bank debit can reduce payment costs.";
const pagePath = "/stripe-vs-gocardless";
const updatedAt = "2026-07-13";
const ogImage = buildOgImageUrl({ title: "Stripe vs GoCardless fees", eyebrow: "Payment comparison" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  keywords: [
    "Stripe vs GoCardless",
    "GoCardless vs Stripe fees",
    "Stripe ACH fees",
    "SEPA Direct Debit vs card fees",
    "SaaS payment fees",
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
  eyebrow: "Stripe vs GoCardless",
  h1: "Stripe vs GoCardless: compare card checkout against bank debit.",
  intro:
    "GoCardless is not a drop-in card checkout replacement. It is most interesting when recurring bank debit, SEPA, ACH, Bacs, or invoice payments can replace expensive card-funded payments.",
  alternativeName: "GoCardless",
  heroTitle: "Bank debit can be cheaper, but only for the right payments.",
  heroBody:
    "For B2B SaaS, annual invoices, and recurring subscriptions, bank debit may reduce card processing drag. For consumer checkout, cards may still convert better.",
  scenarios: [
    {
      useCase: "Recurring SaaS",
      stripe: "Strong for card subscriptions, invoices, upgrades, trials, and online checkout.",
      alternative: "Strong when customers accept direct debit or bank debit as the recurring payment method.",
      decision: "Segment B2B and annual-plan customers first; do not force every buyer away from cards.",
    },
    {
      useCase: "Large B2B invoices",
      stripe: "Card-funded invoices can become expensive at high ticket sizes.",
      alternative: "Bank debit or account-to-account payments may fit finance teams that already prefer bank payments.",
      decision: "Offer bank debit for large invoices while keeping card fallback for speed.",
    },
    {
      useCase: "Instant consumer checkout",
      stripe: "Cards and wallets are familiar and can be fast.",
      alternative: "Bank debit can add friction and may not be ideal for one-off impulse purchases.",
      decision: "Do not optimize fees at the expense of conversion without testing.",
    },
    {
      useCase: "EU/UK subscriptions",
      stripe: "Cards may carry cross-border or international mix costs.",
      alternative: "SEPA/Bacs/direct debit can be a serious option for recurring payments.",
      decision: "Check how much international card uplift exists before adding local bank methods.",
    },
    {
      useCase: "Refund-heavy flows",
      stripe: "Refund fee leakage can be a margin problem in card data.",
      alternative: "Bank debit has its own failure, retry, and mandate mechanics.",
      decision: "Inspect refund reasons and payment failure costs, not only headline fees.",
    },
  ],
  goodFit: [
    {
      title: "You have B2B invoices",
      body: "Customers may already be comfortable with bank payments, especially for annual or larger invoices.",
    },
    {
      title: "You sell recurring plans",
      body: "A monthly or annual payment rhythm gives customers time to accept a bank-debit flow.",
    },
    {
      title: "International card uplift is material",
      body: "If your CSV shows international card drag, local bank methods can be worth testing.",
    },
  ],
  badFit: [
    {
      title: "Checkout conversion is fragile",
      body: "A cheaper payment method can still lose money if it reduces conversion or increases support.",
    },
    {
      title: "You need instant one-off card checkout",
      body: "Cards and wallets may be better for speed, buyer familiarity, and low-friction purchases.",
    },
    {
      title: "You have not separated card vs all-in cost",
      body: "Bank debit will not fix unrelated fee lines, disputes, or subscription add-ons.",
    },
  ],
  checklist: [
    "Find large card-funded invoices and annual-plan charges in your Stripe export.",
    "Check how much international card uplift contributes to charge fees.",
    "Estimate bank-debit savings only for customers likely to accept it.",
    "Keep card fallback for customers where checkout friction would hurt conversion.",
    "Test bank debit on one segment before changing the whole checkout.",
  ],
  officialSources: [
    { title: "Stripe pricing", href: "https://stripe.com/pricing" },
    { title: "GoCardless pricing", href: "https://gocardless.com/pricing/" },
    { title: "Stripe ACH vs credit card guide", href: "/blog/stripe-ach-vs-credit-card-fees" },
  ],
  related: [
    { title: "ACH vs credit card fees", href: "/blog/stripe-ach-vs-credit-card-fees" },
    { title: "Stripe international card fees", href: "/blog/stripe-international-card-fees" },
    { title: "Should I switch from Stripe?", href: "/should-i-switch-from-stripe" },
    { title: "Stripe alternatives in 2026", href: "/blog/stripe-alternatives-2026" },
  ],
  ctaCampaign: "stripe_vs_gocardless",
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
        name: "Is GoCardless cheaper than Stripe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It can be cheaper for certain bank-debit or account-to-account payment flows, especially recurring or B2B payments, but it is not a universal replacement for card checkout.",
        },
      },
      {
        "@type": "Question",
        name: "When should SaaS use bank debit instead of cards?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bank debit is usually most relevant for large B2B invoices, annual plans, or recurring payments where customers accept bank-payment workflows.",
        },
      },
    ],
  },
];

export default function StripeVsGoCardlessPage() {
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
