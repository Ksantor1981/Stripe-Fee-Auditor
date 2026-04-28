import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          See Your Real <span className="text-blue-600">Stripe Fee Rate</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-600">
          Upload your Stripe Balance CSV and get an instant breakdown — effective rate,
          fee drivers, anomalies, and month-over-month trends. No account needed.
        </p>
        <Link
          href="/analyze"
          className="mt-10 inline-block rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          Analyze My Fees →
        </Link>

        {/* Trust signals */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>🗑️</span> File deleted after 1 hour
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span> No account required
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span> Results in 30 seconds
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Export CSV", body: "Download your Balance report from the Stripe Dashboard." },
              { step: "2", title: "Upload", body: "Drop your CSV file — we parse and analyze it instantly." },
              { step: "3", title: "See Results", body: "Get your effective fee rate, top cost drivers, and anomalies." },
            ].map(({ step, title, body }) => (
              <div key={step} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-xs text-gray-400">
        <p>
          Stripe Fee Auditor is not affiliated with Stripe, Inc.{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>{" "}
          ·{" "}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
        </p>
      </footer>
    </main>
  );
}
