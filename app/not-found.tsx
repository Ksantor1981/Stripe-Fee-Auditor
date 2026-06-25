import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-16 text-gray-950">
      <section className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          This page is gone, but your Stripe fee check is still here.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          Start with a free CSV preview, or browse the guides if you are still figuring out which Stripe export you need.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/analyze"
            className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Analyze my CSV
          </Link>
          <Link
            href="/blog"
            className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Read the guides
          </Link>
        </div>
      </section>
    </main>
  );
}
