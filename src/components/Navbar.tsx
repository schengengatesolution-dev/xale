import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-lg font-bold text-white">
            x
          </span>
          <span className="text-xl font-bold tracking-tight text-stone-900">
            xale
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/listings"
            className="rounded-lg px-2 py-1.5 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            Зарууд
          </Link>

          {session?.role === "SELLER" && (
            <>
              <Link
                href="/seller/listings"
                className="rounded-lg px-2 py-1.5 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                Миний зарууд
              </Link>
              <Link
                href="/seller/interests"
                className="hidden rounded-lg px-2 py-1.5 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 sm:inline"
              >
                Сонирхол
              </Link>
            </>
          )}

          {session ? (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-[120px] truncate text-stone-500 sm:inline">
                {session.name}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !px-3 !py-1.5">
                Нэвтрэх
              </Link>
              <Link href="/signup" className="btn-primary !px-3 !py-1.5">
                Бүртгүүлэх
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
