import Link from "next/link";

/** Product and retention disclosure shown next to article audit CTAs. */
export function BlogBetaRetentionNote({ tone = "blue" }: { tone?: "blue" | "gray" }) {
  const cls =
    tone === "blue"
      ? "mt-3 text-xs leading-relaxed text-blue-900/85"
      : "mt-3 text-xs leading-relaxed text-gray-600 max-w-lg mx-auto";

  return (
    <p className={cls}>
      <strong>Free Stripe Fee Audit:</strong> real uploads receive the complete report with no
      signup or credit card. The raw CSV is not stored; computed reports stay available for up to
      30 days under our{" "}
      <Link href="/privacy" className="font-medium underline">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
