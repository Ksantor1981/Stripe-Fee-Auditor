import type { FeeGrade } from "@/lib/fee-grade";

const GRADE_STYLES: Record<
  FeeGrade["letter"],
  { ring: string; bg: string; text: string; label: string }
> = {
  A: {
    ring: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    label: "Efficient",
  },
  B: {
    ring: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-800",
    label: "Healthy",
  },
  C: {
    ring: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-900",
    label: "Review",
  },
  D: {
    ring: "border-orange-200",
    bg: "bg-orange-50",
    text: "text-orange-900",
    label: "Leaking",
  },
  F: {
    ring: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-800",
    label: "Critical",
  },
};

type Props = {
  grade: FeeGrade;
  size?: "sm" | "md" | "lg";
  showSummary?: boolean;
  className?: string;
};

export function FeeGradeBadge({ grade, size = "md", showSummary = true, className = "" }: Props) {
  const styles = GRADE_STYLES[grade.letter];
  const sizeClass =
    size === "lg"
      ? "px-4 py-3"
      : size === "sm"
        ? "px-2.5 py-1.5"
        : "px-3 py-2";
  const letterClass =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div
      className={`rounded-xl border ${styles.ring} ${styles.bg} ${sizeClass} ${className}`}
      title={grade.summary}
    >
      <div className="flex items-center gap-3">
        <div className={`font-black leading-none ${letterClass} ${styles.text}`}>
          {grade.letter}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}>
            Stripe fee grade · {styles.label}
          </p>
          {showSummary && (
            <p className="mt-0.5 text-xs leading-snug text-gray-600">{grade.summary}</p>
          )}
          {grade.topIssue && showSummary && (
            <p className="mt-1 text-[11px] leading-snug text-gray-500">
              Top driver: {grade.topIssue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
