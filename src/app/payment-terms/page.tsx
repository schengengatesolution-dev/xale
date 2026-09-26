import type { Metadata } from "next";
import Link from "next/link";
import { createT, getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const t = createT(getLocale());
  return {
    title: t("payment.metaTitle"),
    description: t("payment.metaDesc"),
  };
}

export default function PaymentTermsPage() {
  const t = createT(getLocale());

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        {t("payment.title")}
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        {t("payment.updated")} ·{" "}
        <strong className="text-stone-700">{t("brand.name")}</strong>
      </p>

      <div className="prose-xale mt-10 space-y-8 text-stone-700">
        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            {t("payment.buyerTitle")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              {t("payment.buyer1Before")}
              <strong>{t("payment.buyer1Strong")}</strong>
              {t("payment.buyer1After")}
            </li>
            <li>
              {t("payment.buyer2Before")}
              <strong>{t("payment.buyer2Strong")}</strong>
              {t("payment.buyer2After")}
            </li>
            <li>{t("payment.buyer3")}</li>
            <li>{t("payment.buyer4")}</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            {t("payment.storeTitle")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>{t("payment.store1")}</li>
            <li>
              {t("payment.store2Before")}
              <strong>{t("payment.store2Strong")}</strong>
              {t("payment.store2Mid")}
              <Link href="/seller/settings" className="font-semibold text-green-700">
                /seller/settings
              </Link>
              {t("payment.store2After")}
            </li>
            <li>
              {t("payment.store3Before")}
              <strong>{t("payment.store3Strong")}</strong>
              {t("payment.store3After")}
            </li>
            <li>{t("payment.store4")}</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            {t("payment.bagTitle")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>{t("payment.bag1")}</li>
            <li>{t("payment.bag2")}</li>
            <li>{t("payment.bag3")}</li>
          </ul>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/map" className="btn-primary">
          {t("payment.mapCta")}
        </Link>
        <Link href="/how-it-works" className="btn-secondary">
          {t("payment.howCta")}
        </Link>
      </div>
    </div>
  );
}
