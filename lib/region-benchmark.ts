/** Directional “typical blended” midpoints for viral comparison — not survey-backed. */

export type RegionBenchmarkId = "us" | "eu" | "uk" | "global";

export interface RegionBenchmark {
  id: RegionBenchmarkId;
  label: string;
  /** Midpoint % we compare against (card-heavy online businesses, heuristic). */
  typicalMidPct: number;
  /** Short explanation shown under the comparison. */
  context: string;
}

export const REGION_BENCHMARKS: RegionBenchmark[] = [
  {
    id: "us",
    label: "United States",
    typicalMidPct: 3.15,
    context: "Typical US SaaS / e‑commerce mixes often land slightly above 2.9% + $0.30 once fixed fees and card mix are included.",
  },
  {
    id: "eu",
    label: "EU",
    typicalMidPct: 3.45,
    context: "EU-heavy mixes often see higher blended rates because cross‑border and local‑scheme variation shows up in exports.",
  },
  {
    id: "uk",
    label: "United Kingdom",
    typicalMidPct: 3.28,
    context: "UK-facing businesses usually sit between US and broader EU patterns on blended Stripe exports.",
  },
  {
    id: "global",
    label: "Global / mixed",
    typicalMidPct: 3.35,
    context: "When payouts and customers span regions, blended rates cluster higher than a pure domestic US mix.",
  },
];

export function getRegionBenchmark(id: RegionBenchmarkId): RegionBenchmark {
  return REGION_BENCHMARKS.find((r) => r.id === id) ?? REGION_BENCHMARKS[0];
}
