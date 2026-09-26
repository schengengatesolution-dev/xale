"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";
import { useT } from "@/lib/i18n";

type Props = {
  session: {
    name: string;
    role: string;
  } | null;
};

export function MobileMenu({ session }: Props) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
      >
        {open ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-stone-200 bg-white shadow-lg">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-sm">
            <Link
              href="/map"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 font-medium text-stone-700 hover:bg-stone-100"
            >
              {t("nav.luckyBagsMap")}
            </Link>
            <Link
              href="/listings"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 font-medium text-stone-700 hover:bg-stone-100"
            >
              {t("nav.listings")}
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 font-medium text-stone-700 hover:bg-stone-100"
            >
              {t("nav.howItWorks")}
            </Link>
            {session?.role === "SELLER" && (
              <>
                <Link
                  href="/seller"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-medium text-stone-700 hover:bg-stone-100"
                >
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/seller/listings"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-medium text-stone-700 hover:bg-stone-100"
                >
                  {t("nav.myListings")}
                </Link>
                <Link
                  href="/seller/listings/new"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-medium text-stone-700 hover:bg-stone-100"
                >
                  {t("nav.newListing")}
                </Link>
                <Link
                  href="/seller/reservations"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-medium text-stone-700 hover:bg-stone-100"
                >
                  {t("nav.interests")}
                </Link>
              </>
            )}
            {session ? (
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                <span className="truncate text-stone-500">{session.name}</span>
                <LogoutButton />
              </div>
            ) : (
              <div className="mt-2 flex gap-2 border-t border-stone-100 pt-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary flex-1 !py-2"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="btn-primary flex-1 !py-2"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
