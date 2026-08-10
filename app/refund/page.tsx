import type { Metadata } from "next";
import { LegalDocument, buildLegalPlaceholders } from "@/components/LegalDocument";
import { MarketingShell } from "@/components/MarketingShell";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.refund");
  return {
    title: `${t("title")} | Stripe Fee Auditor`,
    description: t("metaDescription"),
    alternates: { canonical: "/refund" },
  };
}

export default async function RefundPage() {
  const placeholders = buildLegalPlaceholders();

  return (
    <MarketingShell>
      <LegalDocument doc="refund" placeholders={placeholders} />
    </MarketingShell>
  );
}
