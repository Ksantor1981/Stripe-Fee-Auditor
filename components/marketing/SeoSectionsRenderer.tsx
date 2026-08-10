import Link from "next/link";
import { TrackedLink } from "@/components/TrackedLink";
import { renderInlineLinks } from "@/lib/i18n/page-helpers";

type Section = Record<string, unknown>;

function SectionBlock({ children, className = "mb-14" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function renderSection(section: Section, index: number) {
  const type = section.type as string;

  switch (type) {
    case "note":
      return (
        <p key={index} className="text-sm text-gray-500 leading-relaxed mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          {renderInlineLinks(String(section.body ?? ""))}
        </p>
      );
    case "audience":
      return (
        <p key={index} className="text-sm text-gray-500 leading-relaxed mt-4">
          {renderInlineLinks(String(section.body ?? ""))}
        </p>
      );
    case "badge":
      return (
        <p key={index} className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          {String(section.text ?? "")}
        </p>
      );
    case "crossLink":
      return (
        <p key={index} className="text-sm text-gray-600">
          {String(section.text ?? "")}{" "}
          <Link href={String(section.linkHref ?? "#")} className="text-blue-600 underline">
            {String(section.linkLabel ?? "")}
          </Link>
        </p>
      );
    case "example":
      return (
        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{renderInlineLinks(String(section.body ?? ""))}</p>
        </div>
      );
    case "callout":
      return (
        <div key={index} className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
          {section.title ? <h2 className="text-base font-bold text-blue-950">{String(section.title)}</h2> : null}
          <p className="mt-2">{renderInlineLinks(String(section.body ?? ""))}</p>
        </div>
      );
    case "heroCard":
      return (
        <div key={index} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">{String(section.title ?? "")}</p>
          <p className="mt-3 text-sm leading-relaxed text-blue-950">{renderInlineLinks(String(section.body ?? ""))}</p>
          {Array.isArray(section.metrics) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {(section.metrics as string[]).map((m) => (
                <span key={m} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                  {m}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      );
    case "rateCards": {
      const items = (section.items as { label: string; rate: string; note: string; highlight?: boolean }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-6">{String(section.heading)}</h2> : null}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {items.map((d) => (
              <div
                key={d.label}
                className={`rounded-xl p-4 border ${d.highlight ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
              >
                <p className="text-xs text-gray-500 mb-1">{d.label}</p>
                <p className={`text-2xl font-bold mb-1 ${d.highlight ? "text-blue-600" : "text-gray-900"}`}>{d.rate}</p>
                <p className="text-xs text-gray-400">{d.note}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "comparison": {
      const left = section.left as { title: string; items: string[] };
      const right = section.right as { title: string; items: string[] };
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-6">{String(section.heading)}</h2> : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">{left.title}</p>
              <ul className="space-y-2 text-sm text-gray-500">
                {left.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gray-300 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-5">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-3">{right.title}</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {right.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionBlock>
      );
    }
    case "features": {
      const items = (section.items as { title: string; description: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-6">{String(section.heading)}</h2> : null}
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-0.5">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "steps": {
      const steps = (section.steps as { number?: string; step?: string; title: string; body: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.title} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {s.number ?? s.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionBlock>
      );
    }
    case "columns": {
      const columns = (section.columns as { name: string; description: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          {section.body ? <p className="text-sm text-gray-600 mb-4">{renderInlineLinks(String(section.body))}</p> : null}
          <ul className="space-y-2 text-sm text-gray-600">
            {columns.map((col) => (
              <li key={col.name}>
                <span className="font-mono text-gray-800">{col.name}</span> — {col.description}
              </li>
            ))}
          </ul>
        </SectionBlock>
      );
    }
    case "checklist":
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          {section.body ? <p className="text-sm text-gray-600 mb-4">{renderInlineLinks(String(section.body))}</p> : null}
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            {(section.items as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionBlock>
      );
    case "section":
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-xl font-bold text-gray-900 mb-3">{String(section.heading)}</h2> : null}
          {(section.paragraphs as string[] | undefined)?.map((p) => (
            <p key={p.slice(0, 40)} className="text-gray-600 leading-relaxed mb-3">
              {renderInlineLinks(p)}
            </p>
          ))}
          {(section.bullets as string[] | undefined)?.length ? (
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              {(section.bullets as string[]).map((b) => (
                <li key={b.slice(0, 40)}>{renderInlineLinks(b)}</li>
              ))}
            </ul>
          ) : null}
        </SectionBlock>
      );
    case "scenarios": {
      const rows = (section.rows as ProviderScenario[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3">Use case</th>
                  <th className="px-4 py-3">Stripe</th>
                  <th className="px-4 py-3">Alternative</th>
                  <th className="px-4 py-3">Decision</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.useCase} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.useCase}</td>
                    <td className="px-4 py-3 text-gray-600">{row.stripe}</td>
                    <td className="px-4 py-3 text-gray-600">{row.alternative}</td>
                    <td className="px-4 py-3 text-gray-600">{row.decision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBlock>
      );
    }
    case "fitCards": {
      const goodFit = (section.goodFit as { title: string; body: string }[]) ?? [];
      const badFit = (section.badFit as { title: string; body: string }[]) ?? [];
      return (
        <SectionBlock key={index} className="mb-14 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-green-700 mb-3">Good fit</h3>
            <div className="space-y-3">
              {goodFit.map((c) => (
                <div key={c.title} className="rounded-xl border border-green-100 bg-green-50/50 p-4">
                  <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3">Poor fit</h3>
            <div className="space-y-3">
              {badFit.map((c) => (
                <div key={c.title} className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionBlock>
      );
    }
    case "reasons": {
      const items = (section.items as { number: string; title: string; description: string; example: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.number} className="border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-bold text-blue-600 mb-2">{item.number}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{renderInlineLinks(item.description)}</p>
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{item.example}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "formula":
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          {section.formula ? (
            <p className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 mb-4">
              {String(section.formula)}
            </p>
          ) : null}
          {(section.paragraphs as string[] | undefined)?.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm text-gray-600 leading-relaxed mb-3">
              {renderInlineLinks(p)}
            </p>
          ))}
        </SectionBlock>
      );
    case "ctaBlock":
      return (
        <SectionBlock key={index}>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
            {section.title ? <p className="font-semibold text-gray-900">{String(section.title)}</p> : null}
            {section.description ? <p className="mt-2 text-sm text-gray-600">{renderInlineLinks(String(section.description))}</p> : null}
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Link href="/analyze" className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                {String(section.primaryLabel ?? "Analyze CSV →")}
              </Link>
              {section.secondaryLabel ? (
                <Link href="/stripe-fee-calculator" className="inline-flex rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  {String(section.secondaryLabel)}
                </Link>
              ) : null}
            </div>
          </div>
        </SectionBlock>
      );
    case "table": {
      const headers = (section.headers as string[]) ?? [];
      const rows = (section.rows as string[][]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.join("|")} className="border-t border-gray-100">
                    {row.map((cell, ci) => (
                      <td key={`${ci}-${cell.slice(0, 20)}`} className="px-4 py-3 align-top text-gray-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBlock>
      );
    }
    case "twoColumn": {
      const left = section.left as { title: string; body: string };
      const right = section.right as { title: string; body: string };
      return (
        <SectionBlock key={index}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-900 text-sm mb-2">{left.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{renderInlineLinks(left.body)}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5">
              <p className="font-semibold text-gray-900 text-sm mb-2">{right.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{renderInlineLinks(right.body)}</p>
            </div>
          </div>
        </SectionBlock>
      );
    }
    case "platforms": {
      const items = (section.items as { name: string; bestFor: string; watch: string; auditQuestion: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.name} className="rounded-xl border border-gray-200 p-5">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="mt-2 text-sm text-gray-600"><span className="font-medium">Best for:</span> {item.bestFor}</p>
                <p className="mt-1 text-sm text-gray-600"><span className="font-medium">Watch:</span> {item.watch}</p>
                <p className="mt-1 text-sm text-blue-800">{item.auditQuestion}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "useCaseTable": {
      const headers = (section.headers as string[]) ?? [];
      const rows = (section.rows as { useCase: string; stripe: string; paypal: string; wise: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.useCase} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.useCase}</td>
                    <td className="px-4 py-3 text-gray-600">{row.stripe}</td>
                    <td className="px-4 py-3 text-gray-600">{row.paypal}</td>
                    <td className="px-4 py-3 text-gray-600">{row.wise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBlock>
      );
    }
    case "decisionTable": {
      const rows = (section.rows as { symptom: string; inspect: string; firstMove: string; compare: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.symptom} className="rounded-xl border border-gray-200 p-5">
                <p className="font-semibold text-gray-900 text-sm">{row.symptom}</p>
                <p className="mt-2 text-sm text-gray-600"><span className="font-medium">Inspect:</span> {row.inspect}</p>
                <p className="mt-1 text-sm text-gray-600"><span className="font-medium">First move:</span> {row.firstMove}</p>
                <p className="mt-1 text-sm text-blue-800">{row.compare}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "comparisonLinks": {
      const items = (section.items as { href: string; title: string; desc: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl border border-gray-200 p-4 hover:border-blue-200">
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "pillars": {
      const items = (section.items as { title: string; body: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          <div className="grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="mt-2 text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "toolsTable": {
      const items = (section.items as { name: string; bestFor: string; limitation: string; verdict: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.name} className="rounded-xl border border-gray-200 p-5">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="mt-2 text-sm text-gray-600">{item.bestFor}</p>
                <p className="mt-1 text-sm text-gray-500">{item.limitation}</p>
                <p className="mt-2 text-sm font-medium text-blue-800">{item.verdict}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "whenToUse":
      return (
        <SectionBlock key={index}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5">
              <p className="text-xs font-semibold uppercase text-blue-700 mb-3">Use Fee Auditor when</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {(section.useAuditor as string[]).map((item) => (
                  <li key={item.slice(0, 40)} className="flex gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Use something else when</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {(section.useOther as string[]).map((item) => (
                  <li key={item.slice(0, 40)} className="flex gap-2">
                    <span className="text-gray-300">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionBlock>
      );
    case "flow":
    case "workflow": {
      const steps = (section.steps as { step?: string; title: string; body: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {s.step ?? i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{renderInlineLinks(s.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionBlock>
      );
    }
    case "storage":
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-green-100 bg-green-50/40 p-5">
              <p className="text-sm font-semibold text-green-800 mb-3">Stored</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {(section.stored as string[]).map((item) => (
                  <li key={item.slice(0, 40)}>✓ {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Not stored</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {(section.notStored as string[]).map((item) => (
                  <li key={item.slice(0, 40)}>— {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionBlock>
      );
    case "openSource": {
      const links = (section.links as { label: string; href: string; desc: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-3">{String(section.heading)}</h2> : null}
          {section.body ? <p className="text-sm text-gray-600 mb-4">{renderInlineLinks(String(section.body))}</p> : null}
          <div className="space-y-3">
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="block rounded-xl border border-gray-200 p-4 hover:border-blue-200">
                <p className="font-semibold text-blue-600 text-sm">{link.label} →</p>
                <p className="mt-1 text-xs text-gray-500">{link.desc}</p>
              </a>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "privacy":
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-3">{String(section.heading)}</h2> : null}
          {(section.paragraphs as string[] | undefined)?.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm text-gray-600 leading-relaxed mb-3">
              {renderInlineLinks(p)}
            </p>
          ))}
          {(section.items as string[] | undefined)?.length ? (
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              {(section.items as string[]).map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
          ) : null}
        </SectionBlock>
      );
    case "exportGuide":
      return (
        <SectionBlock key={index}>
          <div className="rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {section.title ? <p className="font-semibold text-gray-900">{String(section.title)}</p> : null}
              {section.body ? <p className="mt-1 text-sm text-gray-600">{String(section.body)}</p> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/stripe-balance-csv" className="inline-flex justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                {String(section.primaryLabel ?? "CSV guide")}
              </Link>
              <Link href="/analyze" className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {String(section.secondaryLabel ?? "Upload CSV")}
              </Link>
            </div>
          </div>
        </SectionBlock>
      );
    case "pricingCard":
      return (
        <SectionBlock key={index}>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6">
            <p className="text-3xl font-bold text-gray-900">
              {String(section.price ?? "")}
              <span className="text-lg font-medium text-gray-500">{String(section.period ?? "")}</span>
            </p>
            {section.body ? <p className="mt-3 text-sm text-gray-600">{String(section.body)}</p> : null}
            {(section.included as string[] | undefined)?.length ? (
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {(section.included as string[]).map((item) => (
                  <li key={item.slice(0, 40)} className="flex gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </SectionBlock>
      );
    case "highlights": {
      const items = (section.items as { title: string; body: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          <div className="grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="mt-2 text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "why": {
      const steps = (section.steps as [string, string, string][]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-3">{String(section.heading)}</h2> : null}
          {section.body ? <p className="text-sm text-gray-600 mb-4">{renderInlineLinks(String(section.body))}</p> : null}
          <ol className="space-y-3">
            {steps.map(([num, title, body]) => (
              <li key={num + title} className="flex gap-3 text-sm">
                <span className="font-bold text-blue-600">{num}</span>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-gray-600">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionBlock>
      );
    }
    case "includedNotYet":
      return (
        <SectionBlock key={index}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Included today</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {(section.included as string[]).map((item) => (
                  <li key={item.slice(0, 40)}>✓ {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Not yet</p>
              <ul className="space-y-2 text-sm text-gray-500">
                {(section.notYet as string[]).map((item) => (
                  <li key={item.slice(0, 40)}>— {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionBlock>
      );
    case "newsletter":
      return (
        <SectionBlock key={index}>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
            {section.title ? <p className="font-semibold text-gray-900">{String(section.title)}</p> : null}
            {section.body ? <p className="mt-2 text-sm text-gray-600">{String(section.body)}</p> : null}
          </div>
        </SectionBlock>
      );
    case "founder": {
      const links = (section.links as { label: string; href: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-3">{String(section.heading)}</h2> : null}
          {(section.paragraphs as string[] | undefined)?.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm text-gray-600 leading-relaxed mb-3">
              {renderInlineLinks(p)}
            </p>
          ))}
          <div className="flex flex-wrap gap-3 mt-4">
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                {link.label}
              </a>
            ))}
          </div>
        </SectionBlock>
      );
    }
    case "benefits":
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{String(section.heading)}</h2> : null}
          <ul className="space-y-2 text-sm text-gray-600">
            {(section.items as string[]).map((item) => (
              <li key={item.slice(0, 40)} className="flex gap-2">
                <span className="text-blue-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionBlock>
      );
    case "webApp":
      return (
        <SectionBlock key={index}>
          <div className="rounded-xl border border-gray-200 p-5 text-center">
            {section.heading ? <p className="font-semibold text-gray-900">{String(section.heading)}</p> : null}
            {section.body ? <p className="mt-2 text-sm text-gray-600">{String(section.body)}</p> : null}
            <Link href="/analyze" className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Open web app →
            </Link>
          </div>
        </SectionBlock>
      );
    case "sources":
    case "related": {
      const items = (section.items as { title: string; href: string }[]) ?? [];
      return (
        <SectionBlock key={index}>
          {section.heading ? <h2 className="text-sm font-semibold text-gray-700 mb-3">{String(section.heading)}</h2> : null}
          <div className="space-y-2">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="block text-sm text-blue-600 hover:underline">
                {item.title} →
              </Link>
            ))}
          </div>
        </SectionBlock>
      );
    }
    default:
      if (section.body || section.heading) {
        return (
          <SectionBlock key={index}>
            {section.heading ? <h2 className="text-lg font-semibold text-gray-900 mb-3">{String(section.heading)}</h2> : null}
            {section.body ? <p className="text-sm text-gray-600 leading-relaxed">{renderInlineLinks(String(section.body))}</p> : null}
          </SectionBlock>
        );
      }
      return null;
  }
}

type ProviderScenario = {
  useCase: string;
  stripe: string;
  alternative: string;
  decision: string;
};

export function SeoSectionsRenderer({ sections }: { sections: Section[] }) {
  return <>{sections.map((section, index) => renderSection(section, index))}</>;
}

export function ComparisonHeroActions({ ctaCampaign }: { ctaCampaign: string }) {
  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <TrackedLink
        href="/analyze"
        utm={{ source: "comparison", medium: "cta", campaign: ctaCampaign }}
        funnelEvent="funnel_landing_cta"
        funnelProps={{ placement: `${ctaCampaign}_hero` }}
        className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        Audit my actual Stripe CSV
      </TrackedLink>
      <Link
        href="/stripe-fee-calculator"
        className="inline-flex justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        Start with a quick estimate
      </Link>
    </div>
  );
}
