import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SellerNav } from "@/components/SellerNav";
import { formatMNT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  const [listings, interestCount] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: session.id },
      include: { _count: { select: { interests: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.interest.count({
      where: { listing: { sellerId: session.id } },
    }),
  ]);

  const active = listings.filter((l) => l.status === "ACTIVE").length;
  const sold = listings.filter((l) => l.status === "SOLD").length;
  const recent = listings.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Худалдагчийн самбар</h1>
          <p className="text-sm text-stone-600">
            Сайн байна уу, <strong>{session.name}</strong>
          </p>
        </div>
        <Link href="/seller/listings/new" className="btn-primary">
          + Шинэ зар
        </Link>
      </div>

      <div className="mt-6">
        <SellerNav active="/seller" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Идэвхтэй зар
          </p>
          <p className="mt-2 text-3xl font-bold text-green-700">{active}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Ирсэн сонирхол
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{interestCount}</p>
          <Link
            href="/seller/interests"
            className="mt-2 inline-block text-xs font-semibold text-green-700 hover:underline"
          >
            Харах →
          </Link>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Зарагдсан
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-800">{sold}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Сүүлийн зарууд</h2>
          <Link
            href="/seller/listings"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            Бүгд →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card mt-4 text-center">
            <p className="text-stone-500">Одоогоор зар байхгүй.</p>
            <Link
              href="/seller/listings/new"
              className="btn-primary mt-4 inline-flex"
            >
              Эхний зар үүсгэх
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {recent.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/listings/${l.id}`}
                    className="font-semibold hover:text-green-700"
                  >
                    {l.title}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {formatMNT(l.discountPrice)} · {l._count.interests} сонирхол
                  </p>
                </div>
                <Link
                  href={`/seller/listings/${l.id}/edit`}
                  className="font-semibold text-green-700 hover:underline"
                >
                  Засах
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card mt-8 border-dashed border-stone-300 bg-stone-50">
        <h3 className="font-semibold text-stone-800">Хурдан зөвлөмж</h3>
        <ul className="mt-2 space-y-1 text-sm text-stone-600">
          <li>· Зураг URL нэмбэл зар илүү анхаарал татна.</li>
          <li>· Дуусах огноог зөв оруулбал худалдан авагч яаралтай харна.</li>
          <li>· Сонирхол ирэхэд утас/WhatsApp-аар шууд холбогдоорой.</li>
        </ul>
      </div>
    </div>
  );
}
