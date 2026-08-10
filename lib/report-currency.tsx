"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { fmtCurrency } from "@/lib/format";

const ReportCurrencyContext = createContext("USD");

export function ReportCurrencyProvider({
  currency,
  children,
}: {
  currency: string;
  children: ReactNode;
}) {
  const normalized = currency.trim().toUpperCase() || "USD";
  return (
    <ReportCurrencyContext.Provider value={normalized}>{children}</ReportCurrencyContext.Provider>
  );
}

export function useReportCurrency(): string {
  return useContext(ReportCurrencyContext);
}

/** Format monetary amounts in the report's settlement currency. */
export function useFmtMoney() {
  const currency = useReportCurrency();
  return useMemo(
    () => (value: number, decimals = 2) => fmtCurrency(value, currency, decimals),
    [currency]
  );
}
