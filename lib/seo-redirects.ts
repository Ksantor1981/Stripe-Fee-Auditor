/** Keyword-planner alias paths → canonical SEO landing pages. */
export const SEO_KEYWORD_REDIRECTS = [
  {
    source: "/stripe-cost-calculator",
    destination: "/stripe-fee-calculator",
    permanent: true,
  },
  {
    source: "/stripe-processing-fees-calculator",
    destination: "/stripe-fee-calculator",
    permanent: true,
  },
  {
    source: "/stripe-calculator",
    destination: "/stripe-fee-calculator",
    permanent: true,
  },
  {
    source: "/stripe-calculator-fee",
    destination: "/stripe-fee-calculator",
    permanent: true,
  },
] as const;
