"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onUnlock: () => void;
}

export function EmailGate({ onUnlock }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function isValidEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    // Store email client-side only for now; Day 5 will persist it
    await new Promise((r) => setTimeout(r, 400));
    onUnlock();
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl mb-5">
            📊
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Your report is ready!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your email to see your Stripe fee analysis. We&apos;ll also send
            you the report link so you can come back to it.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="h-11"
              autoFocus
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading ? "Opening report…" : "See My Results →"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-400 text-center">
            No spam. Unsubscribe anytime. File deleted after 1 hour.
          </p>
        </div>

        {/* Trust */}
        <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400">
          <span>🔒 No credit card</span>
          <span>⚡ Free preview</span>
          <span>🗑️ Auto-deleted</span>
        </div>
      </div>
    </main>
  );
}
