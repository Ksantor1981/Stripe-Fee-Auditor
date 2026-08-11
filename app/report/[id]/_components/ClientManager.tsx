"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClientRow } from "@/lib/db";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

const CLIENT_STORAGE_KEY = "feeauditor_client_id";

interface Props {
  reportId: string;
  ownerEmail: string;
  initialClientId?: string | null;
  clients: ClientRow[];
  monitorFullAccess: boolean;
}

export function readStoredClientId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLIENT_STORAGE_KEY);
}

export function storeClientId(clientId: string | null): void {
  if (typeof window === "undefined") return;
  if (clientId) window.localStorage.setItem(CLIENT_STORAGE_KEY, clientId);
  else window.localStorage.removeItem(CLIENT_STORAGE_KEY);
}

export function ClientManager({
  reportId,
  ownerEmail,
  initialClientId,
  clients: initialClients,
  monitorFullAccess,
}: Props) {
  const { t } = useReportTranslations();
  const [clients, setClients] = useState(initialClients);
  const [clientId, setClientId] = useState(initialClientId ?? readStoredClientId());
  const [newClientName, setNewClientName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) storeClientId(clientId);
  }, [clientId]);

  const assignClient = useCallback(
    async (nextClientId: string | null) => {
      setBusy(true);
      setMessage(null);
      try {
        const res = await fetch(`/api/reports/${reportId}/client`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ clientId: nextClientId, email: ownerEmail }),
        });
        if (!res.ok) {
          setMessage(t("clientManager.updateFailed"));
          return;
        }
        setClientId(nextClientId);
        storeClientId(nextClientId);
        setMessage(nextClientId ? t("clientManager.linked") : t("clientManager.cleared"));
      } finally {
        setBusy(false);
      }
    },
    [ownerEmail, reportId, t]
  );

  const createClient = useCallback(async () => {
    const name = newClientName.trim();
    if (name.length < 2) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email: ownerEmail }),
      });
      const data = (await res.json()) as { client?: ClientRow; error?: string };
      if (!res.ok || !data.client) {
        setMessage(t("clientManager.createFailed"));
        return;
      }
      setClients((prev) => [...prev, data.client!].sort((a, b) => a.name.localeCompare(b.name)));
      setNewClientName("");
      await assignClient(data.client.id);
    } finally {
      setBusy(false);
    }
  }, [assignClient, newClientName, ownerEmail, t]);

  if (!monitorFullAccess || !ownerEmail) return null;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t("clientManager.eyebrow")}</p>
      <h2 className="mt-1 text-lg font-bold text-slate-950">{t("clientManager.title")}</h2>
      <p className="mt-1 text-xs text-slate-500">
        {t("clientManager.body")}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("clientManager.activeClient")}</span>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={clientId ?? ""}
            disabled={busy}
            onChange={(event) => {
              const value = event.target.value;
              void assignClient(value || null);
            }}
          >
            <option value="">{t("clientManager.noClient")}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-1 gap-2">
          <input
            type="text"
            value={newClientName}
            onChange={(event) => setNewClientName(event.target.value)}
            placeholder={t("clientManager.newClientPlaceholder")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => void createClient()}
            disabled={busy || newClientName.trim().length < 2}
            className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("clientManager.add")}
          </button>
        </div>
      </div>

      {message && <p className="mt-3 text-xs text-slate-600">{message}</p>}
    </section>
  );
}
