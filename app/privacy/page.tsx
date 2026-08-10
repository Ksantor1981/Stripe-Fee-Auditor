import type { Metadata } from "next";
import { LegalDocument, buildLegalPlaceholders } from "@/components/LegalDocument";
import { MarketingShell } from "@/components/MarketingShell";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.privacy");
  return {
    title: `${t("title")} | Stripe Fee Auditor`,
    description: t("metaDescription"),
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const placeholders = buildLegalPlaceholders();

  return (
    <MarketingShell>
      <LegalDocument doc="privacy" placeholders={placeholders} />
    </MarketingShell>
  );
}
