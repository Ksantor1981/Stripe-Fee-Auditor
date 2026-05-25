import Link from "next/link";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";

/** Disclosure next to Fee Auditor CTAs: beta full access vs post-beta preview / paid unlock. */
export function BlogBetaRetentionNote({ tone = "blue" }: { tone?: "blue" | "gray" }) {
  const cls =
    tone === "blue"
      ? "mt-3 text-xs leading-relaxed text-blue-900/85"
      : "mt-3 text-xs leading-relaxed text-gray-600 max-w-lg mx-auto";

  if (FULL_REPORTS_FREE_DURING_BETA) {
    return (
      <p className={cls}>
        <strong>Beta:</strong> While our promotional beta runs, real uploads get the{" "}
        <strong>full report free</strong> for up to <strong>30 days</strong>. After beta, access follows our{" "}
        <Link href="/privacy" className="underline font-medium">
          Privacy Policy
        </Link>{" "}
        (short unpaid preview vs one-time full-report unlock).
      </p>
    );
  }

  return (
    <p className={cls}>
      <strong>Free preview:</strong> Upload your Balance CSV, check the headline rate and top drivers,
      then unlock the full report for a <strong>$12 one-time payment</strong> if you want line-level
      anomalies, exports, and savings actions. Full-report private links stay available for{" "}
      <strong>30 days</strong>; see the{" "}
      <Link href="/privacy" className="underline font-medium">
        Privacy Policy
      </Link>{" "}
      for retention details.
    </p>
  );
}
