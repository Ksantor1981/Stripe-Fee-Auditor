"use client";

import { useState } from "react";

type Props = {
  source?: string;
};

export function ManageBillingForm({ source = "monitor_page" }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/billing/portal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not send the billing link. Try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Could not send the billing link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
        Check your inbox. The billing link opens Polar so you can update payment details or cancel Fee Monitor.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-950">Manage billing or cancel</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        Enter the email you used at checkout. We will send a private Polar portal link.
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="rounded-xl border border-gray-200 bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {loading ? "Sending..." : "Send link"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
