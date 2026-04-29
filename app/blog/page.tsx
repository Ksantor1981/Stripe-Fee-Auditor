import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Stripe Fee Auditor",
  description: "Guides on understanding and reducing your Stripe fees.",
};

const POSTS = [
  { slug: "why-stripe-fees-increase", title: "Why Did My Stripe Fees Increase?", desc: "5 common reasons your effective rate is climbing.", time: "5 min" },
  { slug: "how-to-reduce-stripe-fees", title: "How to Reduce Your Stripe Fees", desc: "Practical tactics: custom pricing, ACH, fewer disputes.", time: "7 min" },
  { slug: "stripe-effective-fee-rate-explained", title: "What Is Your Stripe Effective Fee Rate?", desc: "How to calculate it and what a healthy rate looks like.", time: "4 min" },
];

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Home</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Blog</h1>
        <p className="mt-2 text-gray-500">Guides on Stripe fees, optimization, and analytics.</p>
        <div className="mt-10 space-y-4">
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow transition-all">
              <h2 className="font-semibold text-gray-900">{p.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
              <p className="mt-2 text-xs text-gray-400">{p.time} read</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
