import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-cream-100/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow-sm">
            Х
          </span>
          <div className="leading-tight">
            <span className="block text-xl font-bold tracking-tight text-green-800">
              Хайран
            </span>
            <span className="hidden text-[10px] font-medium tracking-wider text-stone-500 sm:block">
              Хайран Юм
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/map"
            className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
          >
            Азтай уут
          </Link>
          <Link
            href="/listings"
            className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
          >
            Жагсаалт
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
          >
            Хэрхэн ажилладаг вэ?
          </Link>

          {session?.role === "SELLER" && (
            <>
              <Link
                href="/seller"
                className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
              >
                Самбар
              </Link>
              <Link
                href="/seller/listings"
                className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
              >
                Миний зарууд
              </Link>
              <Link
                href="/seller/reservations"
                className="rounded-full px-3 py-2 font-medium text-stone-600 hover:bg-cream-200 hover:text-stone-900"
              >
                Сонирхол
              </Link>
              <Link
                href="/seller/listings/new"
                className="btn-primary !px-4 !py-1.5"
              >
                + Азтай уут
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
              <Link href="/login" className="btn-secondary !px-4 !py-1.5">
                Нэвтрэх
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-1.5">
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
