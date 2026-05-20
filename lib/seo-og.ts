import { absoluteUrl } from "@/lib/site-url";

const OG_IMAGE_PATH = "/api/og";

export function buildOgImageUrl({
  title,
  eyebrow = "Fee Auditor",
}: {
  title: string;
  eyebrow?: string;
}): string {
  const params = new URLSearchParams({
    title,
    eyebrow,
  });

  return absoluteUrl(`${OG_IMAGE_PATH}?${params.toString()}`);
}
