import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-lg font-bold text-white shadow-sm">
            x
          </span>
          <div className="leading-tight">
            <span className="block text-xl font-bold tracking-tight text-stone-900">
              xale
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-stone-400 sm:block">
              Илүүдэл бараа
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/listings"
            className="rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            Зарууд
          </Link>

          {session?.role === "SELLER" && (
            <>
              <Link
                href="/seller"
                className="rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                Самбар
              </Link>
              <Link
                href="/seller/listings"
                className="rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                Миний зарууд
              </Link>
              <Link
                href="/seller/interests"
                className="rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                Сонирхол
              </Link>
              <Link
                href="/seller/listings/new"
                className="btn-primary !px-3 !py-1.5"
              >
                + Зар
              </Link>
            </>
          )}

          {session ? (
            <div className="ml-2 flex items-center gap-2 border-l border-stone-200 pl-3">
              <span className="max-w-[140px] truncate text-stone-500">
                {session.name}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login" className="btn-secondary !px-3 !py-1.5">
                Нэвтрэх
              </Link>
              <Link href="/signup" className="btn-primary !px-3 !py-1.5">
                Бүртгүүлэх
              </Link>
            </div>
          )}
        </nav>

        <MobileMenu
          session={
            session
              ? { name: session.name, role: session.role }
              : null
          }
        />
      </div>
    </header>
  );
}
