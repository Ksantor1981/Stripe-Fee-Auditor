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


function phaseOneLegalSections(doc: LegalDocKey, sections: LegalSection[]): LegalSection[] {
  if (doc === "refund") {
    return [
      {
        heading: "Current free access",
        paragraphs: [
          "The complete Stripe fee audit is currently provided for $0. No signup, card, checkout, or purchase is required, so there is no audit charge to refund.",
          "If you see an unexpected historical charge or believe you were charged in error, contact {contactEmail}. Nothing here limits consumer rights that apply to an earlier purchase.",
        ],
      },
    ];
  }

  if (doc === "terms") {
    return sections.map((section) =>
      section.heading.startsWith("7.")
        ? {
            heading: "7. Free access and legacy billing",
            paragraphs: [
              "The current Stripe fee audit is provided for $0 with no card or checkout. Automatic monitoring and the multi-company CFO workflow are research concepts, not paid products. Legacy billing infrastructure may remain inactive in the Service and may be reused only if a separate paid product is offered later with clear terms.",
            ],
          }
        : section
    );
  }

  return sections.map((section) => {
    if (section.heading.startsWith("2.")) {
      return {
        heading: "2. Data we collect",
        paragraphs: [
          "The raw Stripe CSV is transmitted over HTTPS, processed in memory for the analysis request, and is not stored as a file or sent to an AI provider. We retain only the computed report data needed to show totals, rates, fee drivers, and selected transaction evidence.",
          "A report is linked to a random ID and private access token and is retained for up to 30 days. An email address is stored only when you explicitly join monitoring early access, the CFO pilot, or another optional list.",
          "We may retain first-touch attribution, aggregate funnel events, and an IP address used for abuse prevention. These analytics do not contain the raw CSV.",
        ],
      };
    }
    if (section.heading.startsWith("3.")) {
      return {
        heading: "3. How we use your data",
        bullets: [
          "Generate and display the complete free fee audit",
          "Measure aggregate product usage and improve the Service",
          "Record optional monitoring or CFO-pilot interest",
          "Enforce rate limits, prevent abuse, and debug errors",
          "Send updates only for an option you explicitly choose",
        ],
      };
    }
    if (section.heading.startsWith("4.")) {
      return {
        heading: "4. Legal bases",
        paragraphs: ["Where data protection law requires a legal basis, we rely on:"],
        bullets: [
          "Contract - to process the CSV and provide the report you request",
          "Legitimate interests - to secure, debug, and measure aggregate use of the Service",
          "Consent - for optional early-access, pilot, or marketing messages",
          "Legal obligations - where applicable records must be retained",
        ],
      };
    }
    if (section.heading.startsWith("6.")) {
      return {
        heading: "6. Data retention",
        bullets: [
          "Raw CSV file - not stored as a file; processed in memory for the request only",
          "Computed free report - up to 30 days from report creation",
          "Early-access or CFO-pilot email - until deletion request or list cleanup",
          "Attribution fields - deleted with the related report row",
          "IP rate-limit records - approximately 2 days",
          "Aggregate analytics - retained under the configured analytics provider policy",
        ],
      };
    }
    return section;
  });
}
export async function LegalDocument({ doc, placeholders = {} }: Props) {
  const t = await getTranslations(`legal.${doc}`);
  const translatedSections = t.raw("sections") as LegalSection[];
  const sections = phaseOneLegalSections(doc, translatedSections);

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
