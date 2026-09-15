import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CATEGORIES,
  formatMNT,
  formatPickupWindow,
  STATUSES,
} from "@/lib/constants";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { SellerNav } from "@/components/SellerNav";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function SellerListingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.id },
    include: {
      _count: {
        select: { reservations: { where: { status: "RESERVED" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Миний Surprise Bag</h1>
          <p className="text-sm text-stone-600">Сайн байна уу, {session.name}</p>
        </div>
        <Link href="/seller/listings/new" className="btn-primary">
          + Шинэ Bag
        </Link>
      </div>

      <div className="mt-6">
        <SellerNav active="/seller/listings" />
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="Одоогоор Surprise Bag байхгүй"
          description="Илүүдэл хоолоо Surprise Bag болгон оруулаад хаягдлыг бууруулаарай."
          actionHref="/seller/listings/new"
          actionLabel="Эхний Bag үүсгэх"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Гарчиг</th>
                <th className="px-4 py-3">Ангилал</th>
                <th className="px-4 py-3">Үнэ</th>
                <th className="px-4 py-3">Үлдсэн</th>
                <th className="px-4 py-3">Авах цонх</th>
                <th className="px-4 py-3">Төлөв</th>
                <th className="px-4 py-3">Захиалга</th>
                <th className="px-4 py-3">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr
                  key={l.id}
                  className="border-b last:border-0 hover:bg-stone-50/80"
                >
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
                  <td className="px-4 py-3">{formatMNT(l.bagPrice)}</td>
                  <td className="px-4 py-3">{l.quantityAvailable}</td>
                  <td className="px-4 py-3 text-xs">
                    {formatPickupWindow(l.pickupStart, l.pickupEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        l.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : l.status === "SOLD_OUT"
                            ? "bg-stone-200 text-stone-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {STATUSES[l.status as keyof typeof STATUSES] || l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{l._count.reservations}</td>
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
