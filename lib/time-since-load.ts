/** Per-path load marks for Time to Upload / Time to Demo (rounded to 500 ms). */

const pathLoadMarks = new Map<string, number>();

function normalizePath(pathname: string): string {
  if (pathname.startsWith("/analyze")) return "/analyze";
  return pathname || "/";
}

export function roundMsSinceLoad(ms: number): number {
  return Math.round(Math.max(0, ms) / 500) * 500;
}

export function markPathLoad(pathname: string): void {
  if (typeof performance === "undefined") return;
  pathLoadMarks.set(normalizePath(pathname), performance.now());
}

export function getMsSincePathLoad(pathname: string): number {
  if (typeof performance === "undefined") return 0;

  const key = normalizePath(pathname);
  const mark = pathLoadMarks.get(key);
  if (mark !== undefined) {
    return roundMsSinceLoad(performance.now() - mark);
  }

  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const elapsed = nav ? performance.now() - nav.startTime : performance.now();
  return roundMsSinceLoad(elapsed);
}

const TIME_TO_ACTION_EVENTS = new Set([
  "funnel_landing_cta",
  "funnel_sample_cta",
  "funnel_csv_loaded",
]);

export function withMsSinceLoad(
  eventName: string,
  props: Record<string, string | number | boolean>,
  pathname: string
): Record<string, string | number | boolean> {
  if (!TIME_TO_ACTION_EVENTS.has(eventName) || props.ms_since_load !== undefined) {
    return props;
  }

  const pathForEvent = eventName === "funnel_csv_loaded" ? "/analyze" : pathname;
  return { ...props, ms_since_load: getMsSincePathLoad(pathForEvent) };
}

/** Test helper — reset marks between unit tests. */
export function resetPathLoadMarksForTests(): void {
  pathLoadMarks.clear();
}
