"use client";

import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { MobileMenu } from "./MobileMenu";
import { LanguageToggle, useT } from "@/lib/i18n";

type Props = {
  session: { name: string; role: string } | null;
};

export function NavbarClient({ session }: Props) {
  const t = useT();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-cream-100/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow-sm">
            {t("brand.letter")}
          </span>
          <div className="leading-tight">
            <span className="block text-xl font-bold tracking-tight text-green-800">
              {t("brand.name")}
            </span>
            <span className="hidden text-[10px] font-medium tracking-wider text-stone-500 sm:block">
              {t("brand.slogan")}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/map"
            className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
          >
            {t("nav.luckyBags")}
          </Link>
          <Link
            href="/listings"
            className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
          >
            {t("nav.listings")}
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
          >
            {t("nav.howItWorks")}
          </Link>

          {session?.role === "SELLER" && (
            <>
              <Link
                href="/seller"
                className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/seller/listings"
                className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
              >
                {t("nav.myListings")}
              </Link>
              <Link
                href="/seller/reservations"
                className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
              >
                {t("nav.interests")}
              </Link>
              <Link
                href="/seller/listings/new"
                className="btn-primary !px-4 !py-1.5"
              >
                {t("nav.newLuckyBag")}
              </Link>
            </>
          )}

          <LanguageToggle className="ml-1" />

          {session ? (
            <div className="ml-2 flex items-center gap-2 border-l border-stone-200 pl-3">
              <span className="max-w-[140px] truncate text-stone-500">
                {session.name}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login" className="btn-secondary !px-4 !py-1.5">
                {t("nav.login")}
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-1.5">
                {t("nav.signup")}
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <MobileMenu session={session} />
        </div>
      </div>
    </header>
  );
}
