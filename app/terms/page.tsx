import type { Metadata } from "next";
import { LegalDocument, buildLegalPlaceholders } from "@/components/LegalDocument";
import { MarketingShell } from "@/components/MarketingShell";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms");
  return {
    title: `${t("title")} | Stripe Fee Auditor`,
    description: t("metaDescription"),
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const placeholders = await buildLegalPlaceholders();

  return (
    <MarketingShell>
      <LegalDocument doc="terms" placeholders={placeholders} />
    </MarketingShell>
  );
}
