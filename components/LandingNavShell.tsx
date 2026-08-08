import Link from "next/link";

/** Static shell shown while LandingNav JS loads — keeps logo + layout stable for LCP. */
export function LandingNavShell() {
  return (
    <div className="border-b border-gray-100">
      <nav className="relative mx-auto max-w-7xl px-4 py-4 sm:px-8" aria-label="Main">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors shrink-0 sm:text-xl"
          >
            Fee Auditor
          </Link>
          <div
            className="lg:hidden inline-flex size-10 items-center justify-center rounded-lg border border-gray-200 bg-white"
            aria-hidden
          />
          <div className="hidden lg:block h-10 w-28 rounded-lg bg-gray-100" aria-hidden />
        </div>
      </nav>
    </div>
  );
}
