import type { Metadata } from "next";
import Link from "next/link";
import { createT, getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const t = createT(getLocale());
  return {
    title: t("how.metaTitle"),
    description: t("how.metaDesc"),
  };
}

export default function HowItWorksPage() {
  const t = createT(getLocale());

  const STEPS = [
    {
      step: t("how.step1Word"),
      num: "1",
      title: t("how.step1Title"),
      detail: t("how.step1Detail"),
    },
    {
      step: t("how.step2Word"),
      num: "2",
      title: t("how.step2Title"),
      detail: t("how.step2Detail"),
    },
    {
      step: t("how.step3Word"),
      num: "3",
      title: t("how.step3Title"),
      detail: t("how.step3Detail"),
    },
  ];

  return (
    <div className="bg-cream-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
          {t("how.label")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-green-600 sm:text-4xl">
          {t("how.title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          <strong className="text-green-700">{t("how.introBrand")}</strong>
          {t("how.introMid")}
          <strong>{t("how.introLucky")}</strong>
          {t("how.introEnd")}
          <span className="text-stone-500">{t("how.sloganNote")}</span>
        </p>

        <section className="mt-8 rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-green-800">{t("how.whatTitle")}</h2>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-stone-700">
            <li className="flex gap-2">
              <span className="shrink-0 font-bold text-green-600">1.</span>
              <span>
                <strong>{t("how.what1Strong")}</strong>
                {t("how.what1")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-bold text-green-600">2.</span>
              <span>
                <strong>{t("how.what2Strong")}</strong>
                {t("how.what2")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-bold text-green-600">3.</span>
              <span>
                {t("how.what3Before")}
                <strong>{t("how.what3Strong")}</strong>
                {t("how.what3After")}
              </span>
            </li>
          </ul>
        </section>

        <ol className="mt-10 space-y-5">
          {STEPS.map((s) => (
            <li
              key={s.num}
              className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
                <div className="shrink-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-400">
                    {t("how.stepWord")} {s.step}
                  </p>
                  <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                    {s.num}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-green-600">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                    {s.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-10 rounded-3xl border border-green-200 bg-green-50/70 p-6">
          <h2 className="text-lg font-bold text-green-800">{t("how.storeTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            {t("how.storeBodyBefore")}
            <Link href="/seller/settings" className="font-semibold text-green-700">
              {t("how.storeSettings")}
            </Link>
            {t("how.storeBodyAfter")}
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/map" className="btn-primary !px-8 !py-3.5">
            {t("how.mapCta")}
          </Link>
          <Link href="/signup" className="btn-secondary !px-8 !py-3.5">
            {t("how.signupCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
