import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  formatPickupWindow,
  formatMNT,
  RESERVATION_STATUSES,
} from "@/lib/constants";
import { SellerNav } from "@/components/SellerNav";
import { EmptyState } from "@/components/EmptyState";
import { ReservationActions } from "@/components/ReservationActions";

export const dynamic = "force-dynamic";

export default async function SellerReservationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  const reservations = await prisma.reservation.findMany({
    where: { listing: { sellerId: session.id } },
    include: {
      buyer: {
        select: { name: true, phone: true, whatsapp: true, email: true },
      },
      listing: {
        select: {
          id: true,
          title: true,
          bagPrice: true,
          pickupStart: true,
          pickupEnd: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Захиалгууд</h1>
      <p className="mt-1 text-sm text-stone-600">
        Surprise Bag захиалга · Авсан / Ирээгүй тэмдэглэнэ
      </p>

      <div className="mt-6">
        <SellerNav active="/seller/reservations" />
      </div>

      {reservations.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="Одоогоор захиалга байхгүй"
          description="Surprise Bag идэвхтэй байхад худалдан авагчид захиална. Авах цонхыг зөв оруулсан эсэхээ шалгаарай."
          actionHref="/seller/listings"
          actionLabel="Миний уутнууд"
        />
      ) : (
        <ul className="space-y-4">
          {reservations.map((r) => {
            const statusLabel =
              RESERVATION_STATUSES[
                r.status as keyof typeof RESERVATION_STATUSES
              ] || r.status;
            return (
              <li key={r.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/listings/${r.listing.id}`}
                      className="font-semibold text-green-700 hover:underline"
                    >
                      {r.listing.title}
                    </Link>
                    <p className="mt-1 text-xs text-stone-500">
                      {formatDate(r.createdAt)} · {r.buyer.name} ·{" "}
                      {formatMNT(r.listing.bagPrice)}
                    </p>
                    <p className="mt-1 text-xs text-stone-600">
                      Авах:{" "}
                      {formatPickupWindow(
                        r.listing.pickupStart,
                        r.listing.pickupEnd
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.status === "RESERVED"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "COLLECTED"
                            ? "bg-green-100 text-green-800"
                            : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {statusLabel}
                    </span>
                    {r.buyer.phone && (
                      <a
                        href={`tel:${r.buyer.phone}`}
                        className="mt-2 block font-semibold text-green-700"
                      >
                        {r.buyer.phone}
                      </a>
                    )}
                    {r.buyer.whatsapp && (
                      <a
                        href={`https://wa.me/976${r.buyer.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-green-700 hover:underline"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                {r.note && (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                    {r.note}
                  </p>
                )}
                <ReservationActions id={r.id} status={r.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
