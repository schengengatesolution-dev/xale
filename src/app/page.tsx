import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { createT, getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const t = createT(getLocale());

  const STEPS = [
    { step: "1", title: t("home.step1Title"), text: t("home.step1Text") },
    { step: "2", title: t("home.step2Title"), text: t("home.step2Text") },
    { step: "3", title: t("home.step3Title"), text: t("home.step3Text") },
    { step: "4", title: t("home.step4Title"), text: t("home.step4Text") },
  ];

  let featured: Array<{
    id: string;
    title: string;
    category: string;
    bagPrice: number;
    estimatedRetailValue: number;
    quantityAvailable: number;
    pickupStart: Date;
    pickupEnd: Date;
    pickupDistrict: string;
    photoUrl: string | null;
    status: string;
    seller: { name: string } | null;
  }> = [];
  try {
    featured = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: { seller: { select: { name: true } } },
      orderBy: { pickupStart: "asc" },
      take: 6,
    });
  } catch {
    featured = [];
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-[#005A57] to-green-600 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(247,244,239,0.35) 0%, transparent 42%), radial-gradient(circle at 85% 70%, rgba(31,92,69,0.5) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cream-100 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-cream-200" />
            {t("home.badge")}
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            {t("home.heroTitleBefore")}{" "}
            <span className="text-cream-200">{t("home.heroTitleHighlight")}</span>{" "}
            {t("home.heroTitleAfter")}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-green-100">
            {t("home.heroBodyBefore")}
            <strong>{t("home.heroBodyLucky")}</strong>
            {t("home.heroBodyMid")}
            <strong>{t("home.heroBodyFind")}</strong>
            {t("home.heroBodyArrow1")}
            <strong>{t("home.heroBodyOrder")}</strong>
            {t("home.heroBodyArrow2")}
            <strong>{t("home.heroBodyPick")}</strong>
            {t("home.heroBodyAfter")}
            <strong>{t("home.heroBodyCheap")}</strong>
            {t("home.heroBodyEnd")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session ? (
              <Link
                href={session.role === "SELLER" ? "/seller" : "/map"}
                className="rounded-xl bg-cream-100 px-6 py-3.5 text-sm font-bold text-green-800 shadow-lg hover:bg-white"
              >
                {session.role === "SELLER"
                  ? t("home.ctaDashboard")
                  : t("home.ctaNearbyBags")}
              </Link>
            ) : (
              <>
                <Link
                  href="/map"
                  className="rounded-xl bg-cream-100 px-6 py-3.5 text-sm font-bold text-green-800 shadow-lg hover:bg-white"
                >
                  {t("home.ctaNearby")}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-white/20"
                >
                  {t("home.ctaFreeSignup")}
                </Link>
              </>
            )}
            <Link
              href="/how-it-works"
              className="rounded-xl px-4 py-3.5 text-sm font-semibold text-cream-100/90 underline-offset-4 hover:underline"
            >
              {t("home.howLink")}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-green-100/90">
            <div>
              <p className="text-2xl font-bold text-white">{t("home.statSteps")}</p>
              <p>{t("home.statStepsSub")}</p>
            </div>
            <div className="hidden h-10 w-px bg-white/20 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">{t("home.statPay")}</p>
              <p>{t("home.statPaySub")}</p>
            </div>
            <div className="hidden h-10 w-px bg-white/20 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">{t("home.statDistricts")}</p>
              <p>{t("home.statDistrictsSub")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200/70 bg-cream-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
                {t("home.howLabel")}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl">
                {t("home.howTitle")}
              </h2>
              <p className="mt-1 text-sm text-stone-600">{t("home.howSubtitle")}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                {t("home.howBlurb")}
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              {t("home.more")}
            </Link>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.step} className="card relative overflow-hidden">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow-sm">
                  {s.step}
                </span>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-coral-400">
                  {t("home.stepLabel")} {s.step}
                </p>
                <h3 className="mt-1 text-xl font-bold uppercase tracking-tight text-green-600">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                {t("home.featuredTitle")}
              </h2>
              <p className="mt-1 text-sm text-stone-600">{t("home.featuredSub")}</p>
            </div>
            <Link
              href="/map"
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              {t("home.viewAll")}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            {t("home.whyTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">
            {t("home.whyBodyBefore")}
            <strong>{t("home.whyBodyLucky")}</strong>
            {t("home.whyBodyAfter")}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🛍️",
                title: t("home.feature1Title"),
                text: t("home.feature1Text"),
              },
              {
                icon: "⏰",
                title: t("home.feature2Title"),
                text: t("home.feature2Text"),
              },
              {
                icon: "🌍",
                title: t("home.feature3Title"),
                text: t("home.feature3Text"),
              },
            ].map((item) => (
              <div key={item.title} className="card text-center">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs leading-relaxed text-amber-950">
            <strong>{t("home.safetyTitle")}</strong>
            {t("home.safetyText")}
          </p>
        </div>
      </section>

      <section className="bg-cream-200/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("home.dualTitle")}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card border-green-200 bg-green-50/70">
              <h3 className="text-xl font-bold text-green-800">
                {t("home.buyerTitle")}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> {t("home.buyer1")}
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> {t("home.buyer2")}
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> {t("home.buyer3")}
                </li>
              </ul>
              <Link href="/map" className="btn-primary mt-6 inline-flex">
                {t("home.buyerCta")}
              </Link>
            </div>
            <div className="card border-green-200/80 bg-white">
              <h3 className="text-xl font-bold text-green-800">
                {t("home.bizTitle")}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> {t("home.biz1")}
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> {t("home.biz2Before")}
                  <strong>{t("home.biz2Strong")}</strong>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> {t("home.biz3")}
                </li>
              </ul>
              {!session ? (
                <Link href="/signup" className="btn-primary mt-6 inline-flex">
                  {t("home.bizSignup")}
                </Link>
              ) : session.role === "SELLER" ? (
                <Link href="/seller" className="btn-primary mt-6 inline-flex">
                  {t("home.ctaDashboard")}
                </Link>
              ) : (
                <Link
                  href="/payment-terms"
                  className="btn-secondary mt-6 inline-flex"
                >
                  {t("home.paymentTerms")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-900 py-16 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("home.ctaTitle")}</h2>
        <p className="mx-auto mt-3 max-w-md text-green-100">{t("home.ctaBody")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!session ? (
            <>
              <Link
                href="/map"
                className="inline-block rounded-xl bg-cream-100 px-8 py-3.5 text-sm font-bold text-green-800 hover:bg-white"
              >
                {t("home.ctaFind")}
              </Link>
              <Link
                href="/signup"
                className="inline-block rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-cream-100 hover:bg-white/10"
              >
                {t("nav.signup")}
              </Link>
            </>
          ) : (
            <Link
              href={session.role === "SELLER" ? "/seller" : "/map"}
              className="inline-block rounded-xl bg-cream-100 px-8 py-3.5 text-sm font-bold text-green-800 hover:bg-white"
            >
              {t("home.ctaContinue")}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
