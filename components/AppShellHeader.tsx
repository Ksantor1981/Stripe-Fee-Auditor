"use client";

import { LandingNav } from "@/components/LandingNav";

type Props = {
  /** Optional row under nav (report exports, breadcrumbs). */
  toolbar?: React.ReactNode;
};

export function AppShellHeader({ toolbar }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm shadow-gray-100/80">
      <LandingNav />
      {toolbar ? (
        <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
            {toolbar}
          </div>
        </div>
      ) : null}
    </header>
  );
}
