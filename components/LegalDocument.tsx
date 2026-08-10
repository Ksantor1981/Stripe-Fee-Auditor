import Link from "next/link";
import { getTranslations } from "next-intl/server";

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalDocKey = "privacy" | "terms" | "refund";

type Placeholders = Record<string, string>;

type Props = {
  doc: LegalDocKey;
  placeholders?: Placeholders;
};

function fillPlaceholders(text: string, placeholders: Placeholders): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => placeholders[key] ?? `{${key}}`);
}

function renderParagraph(text: string, placeholders: Placeholders) {
  const filled = fillPlaceholders(text, placeholders);
  const emailMatch = filled.match(/([^\s]+@[^\s]+)/);
  if (emailMatch) {
    const email = emailMatch[1];
    const [before, after] = filled.split(email);
    return (
      <p className="text-gray-600 leading-relaxed mt-3 first:mt-0">
        {before}
        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
          {email}
        </a>
        {after}
      </p>
    );
  }
  return <p className="text-gray-600 leading-relaxed mt-3 first:mt-0">{filled}</p>;
}

export async function LegalDocument({ doc, placeholders = {} }: Props) {
  const t = await getTranslations(`legal.${doc}`);
  const sections = t.raw("sections") as LegalSection[];

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
      <p className="text-sm text-gray-400 mb-10">{t("updated")}</p>

      <div className="prose prose-sm prose-gray max-w-none space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <div key={paragraph.slice(0, 40)}>{renderParagraph(paragraph, placeholders)}</div>
            ))}
            {section.bullets?.length ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed mt-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 48)}>{fillPlaceholders(bullet, placeholders)}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {doc === "privacy" ? (
        <p className="mt-10 text-sm text-gray-500">
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>
          {" · "}
          <Link href="/refund" className="text-blue-600 hover:underline">
            Refund Policy
          </Link>
        </p>
      ) : null}
    </main>
  );
}

export function buildLegalPlaceholders(): Placeholders {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "support@feeauditor.com";
  const operatorName =
    process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() || "the operator of Stripe Fee Auditor";
  const operatorJurisdiction = process.env.NEXT_PUBLIC_OPERATOR_JURISDICTION?.trim();
  const operatorAddress = process.env.NEXT_PUBLIC_OPERATOR_ADDRESS?.trim();

  return {
    contactEmail,
    operatorName,
    operatorJurisdictionPart: operatorJurisdiction ? ` (${operatorJurisdiction})` : "",
    operatorAddressPart: operatorAddress ? ` at ${operatorAddress}` : "",
  };
}
