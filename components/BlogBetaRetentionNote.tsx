import Link from "next/link";

/** Disclosure next to Fee Auditor CTAs: beta full access vs post-beta preview / paid unlock. */
export function BlogBetaRetentionNote({ tone = "blue" }: { tone?: "blue" | "gray" }) {
  const cls =
    tone === "blue"
      ? "mt-3 text-xs leading-relaxed text-blue-900/85"
      : "mt-3 text-xs leading-relaxed text-gray-600 max-w-lg mx-auto";

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
