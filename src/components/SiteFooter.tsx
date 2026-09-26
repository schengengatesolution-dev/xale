"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

export function SiteFooter() {
  const pathname = usePathname();
  const t = useT();
  if (pathname === "/map" || pathname?.startsWith("/map/")) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-stone-200 bg-white pb-20 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm text-white">
              {t("brand.letter")}
            </span>
            {t("brand.name")}
          </p>
          <p className="mt-1 text-sm font-medium text-green-800">{t("brand.slogan")}</p>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            {t("footer.tagline")}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{t("footer.links")}</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/map" className="hover:text-green-700">
                {t("nav.luckyBagsMap")}
              </Link>
            </li>
            <li>
              <Link href="/listings" className="hover:text-green-700">
                {t("nav.listings")}
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-green-700">
                {t("nav.howItWorks")}
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-green-700">
                {t("nav.signup")}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-green-700">
                {t("nav.login")}
              </Link>
            </li>
            <li>
              <Link href="/payment-terms" className="hover:text-green-700">
                {t("footer.paymentTerms")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{t("footer.contact")}</p>
          <p className="mt-3 text-sm text-stone-500">
            {t("footer.phone")}:{" "}
            <a href="tel:+97694061666" className="font-medium text-stone-700 hover:text-green-700">
              +976 94061666
            </a>
          </p>
          <p className="mt-2 text-sm text-stone-500">
            {t("footer.domain")}: <span className="font-medium text-stone-700">{t("brand.domain")}</span>
          </p>
        </div>
      </div>
      <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {t("brand.name")} · {t("brand.domain")}
      </div>
    </footer>
  );
}
