import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, formatDate, formatMNT, STATUSES } from "@/lib/constants";
import { DeleteListingButton } from "@/components/DeleteListingButton";

export const dynamic = "force-dynamic";

export default async function SellerListingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.id },
    include: { _count: { select: { interests: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Миний зарууд</h1>
          <p className="text-sm text-stone-600">Сайн байна уу, {session.name}</p>
        </div>
        <Link href="/seller/listings/new" className="btn-primary">
          + Шинэ зар
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-stone-500">Одоогоор зар байхгүй.</p>
          <Link href="/seller/listings/new" className="btn-primary mt-4 inline-flex">
            Эхний зар үүсгэх
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Гарчиг</th>
                <th className="px-4 py-3">Ангилал</th>
                <th className="px-4 py-3">Үнэ</th>
                <th className="px-4 py-3">Дуусах</th>
                <th className="px-4 py-3">Төлөв</th>
                <th className="px-4 py-3">Сонирхол</th>
                <th className="px-4 py-3">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/listings/${l.id}`}
                      className="hover:text-green-700"
                    >
                      {l.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {CATEGORIES[l.category as keyof typeof CATEGORIES] ||
                      l.category}
                  </td>
                  <td className="px-4 py-3">{formatMNT(l.discountPrice)}</td>
                  <td className="px-4 py-3">{formatDate(l.expiryDate)}</td>
                  <td className="px-4 py-3">
                    {STATUSES[l.status as keyof typeof STATUSES] || l.status}
                  </td>
                  <td className="px-4 py-3">{l._count.interests}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/seller/listings/${l.id}/edit`}
                        className="font-semibold text-green-700 hover:underline"
                      >
                        Засах
                      </Link>
                      <DeleteListingButton id={l.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
