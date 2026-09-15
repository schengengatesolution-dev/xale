"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  session: { role: string } | null;
};

const buyerLinks = [
  { href: "/", label: "Нүүр", icon: HomeIcon },
  { href: "/listings", label: "Ол", icon: SearchIcon },
  { href: "/how-it-works", label: "Алхам", icon: StepsIcon },
];

export function BottomNav({ session }: Props) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const sellerExtra =
    session?.role === "SELLER"
      ? [{ href: "/seller", label: "Самбар", icon: BoardIcon }]
      : [{ href: session ? "/listings" : "/signup", label: session ? "Уутнууд" : "Эхлэх", icon: UserIcon }];

  const links = [...buyerLinks.slice(0, 2), ...sellerExtra, buyerLinks[2]];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/90 bg-cream-50/95 backdrop-blur md:hidden pb-safe"
      aria-label="Доод цэс"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5 pb-1">
        {links.map((l) => {
          const active =
            l.href === "/"
              ? pathname === "/"
              : pathname === l.href || pathname?.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <li key={l.href + l.label} className="flex-1">
              <Link
                href={l.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition ${
                  active
                    ? "text-green-600"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon active={!!active} />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  );
}
function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
function StepsIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function BoardIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
