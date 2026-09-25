import Link from "next/link";

const links = [
  { href: "/seller", label: "Самбар" },
  { href: "/seller/listings", label: "Миний уутнууд" },
  { href: "/seller/listings/new", label: "Шинэ уут" },
  { href: "/seller/reservations", label: "Захиалгууд" },
  { href: "/seller/payouts", label: "Төлбөр" },
  { href: "/seller/settings", label: "Банк" },
];

export function SellerNav({ active }: { active?: string }) {
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
