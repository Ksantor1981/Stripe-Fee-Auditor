"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

type WorkspaceTab = "overview" | "drivers" | "trends" | "transactions";

const WorkspaceContext = createContext<WorkspaceTab>("overview");

interface WorkspaceProps {
  children: ReactNode;
  transactionCount?: number;
}

export function ReportWorkspace({ children, transactionCount = 0 }: WorkspaceProps) {
  const { t, tc } = useReportTranslations();
  const [active, setActive] = useState<WorkspaceTab>("overview");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const items: Array<{ value: WorkspaceTab; label: string }> = [
    { value: "overview", label: t("multiMonthReport.tabOverview") },
    { value: "drivers", label: tc("topFeeDrivers") },
    { value: "trends", label: t("multiMonthReport.tabMonthlyDetail") },
    { value: "transactions", label: t("multiMonthReport.tabHighFee") },
  ];

  function selectTab(value: WorkspaceTab) {
    setActive(value);
    trackEvent("report_tab_view", { tab: value });
    requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <WorkspaceContext.Provider value={active}>
      <div ref={workspaceRef} className="scroll-mt-20 space-y-6">
        <nav
          aria-label={tc("workspaceAria")}
          className="sticky top-16 z-30 overflow-x-auto rounded-xl border border-gray-200 bg-[#fbfbf8]/95 p-1.5 shadow-sm backdrop-blur"
        >
          <div className="flex min-w-max gap-1 sm:min-w-0">
            {items.map((item) => {
              const selected = active === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectTab(item.value)}
                  className={`interactive-lift inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors sm:flex-1 ${
                    selected
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-950"
                  }`}
                >
                  {item.label}
                  {item.value === "transactions" && transactionCount > 0 ? (
                    <Badge className={`ml-2 text-[10px] ${selected ? "bg-white/15 text-white" : "bg-red-100 text-red-700"}`}>
                      {transactionCount}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>
        <div className="space-y-8">{children}</div>
      </div>
    </WorkspaceContext.Provider>
  );
}

export function ReportWorkspacePanel({
  value,
  children,
}: {
  value: WorkspaceTab;
  children: ReactNode;
}) {
  const active = useContext(WorkspaceContext);
  if (active !== value) return null;
  return <div className="space-y-8">{children}</div>;
}