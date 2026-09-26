"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/map" || pathname?.startsWith("/map/")) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-stone-200 bg-white pb-20 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm text-white">
              Х
            </span>
            Хайран
          </p>
          <p className="mt-1 text-sm font-medium text-green-800">Хайран Юм</p>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            Азтай уут зах зээлийн үнээс 2-3 дахин хямд.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Холбоос</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/map" className="hover:text-green-700">
                Азтай уут · зураг
              </Link>
            </li>
            <li>
              <Link href="/listings" className="hover:text-green-700">
                Жагсаалт
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-green-700">
                Хэрхэн ажилладаг вэ?
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-green-700">
                Бүртгүүлэх
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-green-700">
                Нэвтрэх
              </Link>
            </li>
            <li>
              <Link href="/payment-terms" className="hover:text-green-700">
                Төлбөрийн нөхцөл
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Холбоо барих</p>
          <p className="mt-3 text-sm text-stone-500">
            Утас:{" "}
            <a href="tel:+97694061666" className="font-medium text-stone-700 hover:text-green-700">
              +976 94061666
            </a>
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Домэйн: <span className="font-medium text-stone-700">hairan.mn</span>
          </p>
        </div>
      </div>
      <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Хайран · hairan.mn
      </div>
    </footer>
  );
}
