"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export function SellerNav({ active }: { active?: string }) {
  const t = useT();
  const links = [
    { href: "/seller", label: t("sellerNav.dashboard") },
    { href: "/seller/listings", label: t("sellerNav.myBags") },
    { href: "/seller/listings/new", label: t("sellerNav.newBag") },
    { href: "/seller/reservations", label: t("sellerNav.orders") },
    { href: "/seller/payouts", label: t("sellerNav.payouts") },
    { href: "/seller/settings", label: t("sellerNav.bank") },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {links.map((l) => {
        const isActive = active === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              isActive
                ? "bg-green-600 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
