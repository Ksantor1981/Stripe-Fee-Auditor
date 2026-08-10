"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export const LANDING_FAQ_HOME_IDS = ["store-csv", "stripe-access", "useful-for-me"] as const;

export const LANDING_FAQ_EXTENDED_IDS = [
  "who-sees",
  "accuracy",
  "worth-12",
  "stripe-refund-policy",
  "stripe-disputes",
  "stripe-billing-fees",
  "stripe-custom-pricing",
  "stripe-regional-rates",
  "chatgpt",
  "excel",
] as const;

const ALL_FAQ_IDS = [...LANDING_FAQ_HOME_IDS, ...LANDING_FAQ_EXTENDED_IDS] as const;

type FaqId = (typeof ALL_FAQ_IDS)[number];

const STRIPE_PRICING = "https://stripe.com/pricing";
const STRIPE_BILLING = "https://stripe.com/billing/pricing";

type LandingFaqProps = {
  itemIds?: readonly string[];
};

function FaqAnswer({ id }: { id: FaqId }) {
  const t = useTranslations("faq");
  const rich = {
    strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
    stripeLink: (chunks: React.ReactNode) => (
      <a
        href={STRIPE_PRICING}
        className="text-blue-600 underline hover:text-blue-800"
        target="_blank"
        rel="noopener noreferrer"
      >
        {chunks}
      </a>
    ),
    billingLink: (chunks: React.ReactNode) => (
      <a
        href={STRIPE_BILLING}
        className="text-blue-600 underline hover:text-blue-800"
        target="_blank"
        rel="noopener noreferrer"
      >
        {chunks}
      </a>
    ),
  };

  const hasSecond = id === "store-csv" || id === "chatgpt";

  return (
    <>
      <p>{t.rich(`${id}.a`, rich)}</p>
      {hasSecond ? <p className="mt-2">{t.rich(`${id}.a2`, rich)}</p> : null}
    </>
  );
}

export function LandingFaq({ itemIds }: LandingFaqProps) {
  const t = useTranslations("faq");
  const ids = (itemIds ?? ALL_FAQ_IDS).filter((id): id is FaqId =>
    (ALL_FAQ_IDS as readonly string[]).includes(id)
  );

  return (
    <Accordion className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
      {ids.map((id) => (
        <AccordionItem key={id} value={id} className="border-gray-100">
          <AccordionTrigger className="text-sm font-semibold text-gray-900 py-4 hover:no-underline">
            {t(`${id}.q`)}
          </AccordionTrigger>
          <AccordionContent className="text-base text-gray-600 leading-relaxed pb-4 space-y-2">
            <FaqAnswer id={id} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
