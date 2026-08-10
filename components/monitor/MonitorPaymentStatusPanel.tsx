import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ManageBillingForm } from "@/components/ManageBillingForm";

type Props = {
  status: "success" | "pending";
};

export async function MonitorPaymentStatusPanel({ status }: Props) {
  const t = await getTranslations("monitorPage");

  if (status === "pending") {
    return (
      <div className="mb-10 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <p className="font-semibold">{t("pendingTitle")}</p>
        <p className="mt-1 leading-relaxed text-amber-800/90">{t("pendingBody")}</p>
      </div>
    );
  }

  return (
    <section className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
        {t("successEyebrow")}
      </p>
      <h2 className="mt-2 text-xl font-bold text-emerald-950">{t("successTitle")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-900/90">{t("successIntro")}</p>

      <ol className="mt-5 space-y-3 text-sm text-emerald-950">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            1
          </span>
          <span>{t("step1")}</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            2
          </span>
          <span>{t("step2")}</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            3
          </span>
          <span>{t("step3")}</span>
        </li>
      </ol>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/analyze?utm_source=monitor&utm_medium=onboarding&utm_campaign=payment_success"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {t("uploadCta")}
        </Link>
        <Link
          href="/analyze?sample=1&utm_source=monitor&utm_medium=onboarding&utm_campaign=payment_success_sample"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
        >
          {t("sampleCta")}
        </Link>
      </div>

      <div className="mt-8 border-t border-emerald-200/80 pt-6">
        <p className="mb-3 text-sm font-semibold text-emerald-950">{t("billingHeading")}</p>
        <ManageBillingForm source="monitor_payment_success" />
      </div>
    </section>
  );
}
