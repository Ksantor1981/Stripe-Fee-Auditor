import { absoluteUrl } from "@/lib/site-url";

const OG_IMAGE_PATH = "/api/og";

export function buildOgImageUrl({
  title,
  eyebrow = "Fee Auditor",
  grade,
  rate,
}: {
  title: string;
  eyebrow?: string;
  /** Optional A–F grade badge for report share cards. */
  grade?: string;
  /** Optional all-in rate percent for report share cards. */
  rate?: string | number;
}): string {
  const params = new URLSearchParams({
    title,
    eyebrow,
  });
  if (grade) params.set("grade", grade.slice(0, 1).toUpperCase());
  if (rate !== undefined && rate !== "") params.set("rate", String(rate));

  return absoluteUrl(`${OG_IMAGE_PATH}?${params.toString()}`);
}
