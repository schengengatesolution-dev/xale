import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isCheckoutEnabled } from "@/lib/qpay";
import {
  CATEGORIES,
  formatMNT,
  formatPickupWindow,
  savingsPercent,
  STATUSES,
} from "@/lib/constants";
import { ReserveForm } from "@/components/ReserveForm";
import { PayCheckout } from "@/components/PayCheckout";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: { id: true, name: true, phone: true, whatsapp: true },
      },
    },
  });

  if (!listing) notFound();

  const session = await getSession();
  const cat =
    CATEGORIES[listing.category as keyof typeof CATEGORIES] || listing.category;
  const discount = savingsPercent(
    listing.bagPrice,
    listing.estimatedRetailValue
  );

  let alreadyReserved = false;
  let unpaidReservationId: string | null = null;
  let paidPickupCode: string | null = null;
  if (session?.role === "BUYER") {
    const existing = await prisma.reservation.findFirst({
      where: {
        listingId: listing.id,
        buyerId: session.id,
        status: "RESERVED",
      },
      select: {
        id: true,
        paymentStatus: true,
        pickupCode: true,
      },
    });
    alreadyReserved = !!existing;
    if (
      existing &&
      existing.paymentStatus !== "PAID" &&
      isCheckoutEnabled()
    ) {
      unpaidReservationId = existing.id;
    }
    if (existing?.paymentStatus === "PAID" && existing.pickupCode) {
      paidPickupCode = existing.pickupCode;
    }
  }

  const canReserve =
    listing.status === "ACTIVE" && listing.quantityAvailable > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/listings" className="text-sm text-green-700 hover:underline">
        ← Азтай уутнууд руу
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          {listing.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.photoUrl}
              alt={listing.title}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-2 text-stone-400">
              <span className="text-6xl">🛍️</span>
              <span className="text-sm font-medium">Азтай уут</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            {cat}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-coral-400">
            Азтай уут
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{listing.title}</h1>
          <p className="mt-1 text-sm text-stone-600">{listing.seller.name}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-green-700">
              {formatMNT(listing.bagPrice)}
            </span>
            <span className="text-lg text-stone-400 line-through">
              {formatMNT(listing.estimatedRetailValue)}
            </span>
            {discount > 0 && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                −{discount}%
              </span>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Үлдсэн уут</dt>
              <dd className="font-semibold">{listing.quantityAvailable}</dd>
            </div>
            <div className="rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Төлөв</dt>
              <dd className="font-semibold">
                {STATUSES[listing.status as keyof typeof STATUSES] ||
                  listing.status}
              </dd>
            </div>
            <div className="col-span-2 rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Авах цонх</dt>
              <dd className="font-semibold">
                {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
              </dd>
            </div>
            <div className="col-span-2 rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Байршил</dt>
              <dd className="font-semibold">
                {listing.pickupDistrict}
                {listing.pickupAddress ? ` · ${listing.pickupAddress}` : ""}
              </dd>
            </div>
          </dl>

          {listing.dietaryNotes && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              <strong>Тэмдэглэл:</strong> {listing.dietaryNotes}
            </p>
          )}

          <div className="mt-6">
            <h2 className="font-semibold">Тайлбар</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
              {listing.description}
            </p>
            <p className="mt-2 text-xs text-stone-500">
              Агуулга нууц — өдөр бүр өөрчлөгдөж болно. Хүнсний аюулгүй
              байдлын хувьд бизнес хариуцна.
            </p>
          </div>

          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs leading-relaxed text-green-900">
            <strong>Азтай уут:</strong> ангилал тодорхой. Доторх зүйлийг
            сонгохгүй (гайхшрал) — үнэ жижиглэнгийн ойролцоогоор ⅓ (~3 дахин
            хямд).
          </p>

          <div className="card mt-6">
            <h2 className="font-semibold">Бизнес</h2>
            <p className="mt-1 text-stone-800">{listing.seller.name}</p>
            {listing.seller.phone && (
              <p className="mt-2 text-sm">
                Утас:{" "}
                <a
                  href={`tel:${listing.seller.phone}`}
                  className="font-semibold text-green-700"
                >
                  {listing.seller.phone}
                </a>
              </p>
            )}
            {listing.seller.whatsapp && (
              <p className="mt-1 text-sm">
                WhatsApp:{" "}
                <a
                  href={`https://wa.me/976${listing.seller.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-green-700"
                >
                  {listing.seller.whatsapp}
                </a>
              </p>
            )}
          </div>

          {canReserve && (
            <div className="card mt-4">
              <h2 className="mb-3 font-semibold">Захиалах</h2>
              {alreadyReserved ? (
                <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
                  <p>
                    Та энэ Азтай уутыг аль хэдийн захиалсан.
                    {unpaidReservationId
                      ? " Төлбөрөө хийснээр баталгаажна."
                      : paidPickupCode
                        ? ""
                        : " Байршил дээр очиж азтай уутаа авна уу!"}
                  </p>
                  {paidPickupCode && (
                    <div className="mt-3 rounded-2xl border-2 border-green-600 bg-white px-4 py-5 text-center shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                        Авах код
                      </p>
                      <p className="mt-2 select-all font-mono text-5xl font-black tracking-[0.2em] text-green-800 sm:text-6xl">
                        {paidPickupCode}
                      </p>
                      <p className="mt-3 text-sm font-medium leading-snug text-stone-700">
                        Дэлгүүрт очиж энэ кодыг хэлнэ үү
                      </p>
                    </div>
                  )}
                  {unpaidReservationId && (
                    <PayCheckout
                      reservationId={unpaidReservationId}
                      amountMnt={listing.bagPrice}
                      checkoutEnabled
                    />
                  )}
                </div>
              ) : session?.role === "BUYER" ? (
                <ReserveForm listingId={listing.id} checkoutEnabled={isCheckoutEnabled()} />
              ) : session?.role === "SELLER" ? (
                <p className="text-sm text-stone-500">
                  Худалдагч захиалах боломжгүй.
                </p>
              ) : (
                <p className="text-sm text-stone-600">
                  Захиалахын тулд{" "}
                  <Link href="/login" className="font-semibold text-green-700">
                    нэвтэрнэ үү
                  </Link>{" "}
                  эсвэл{" "}
                  <Link href="/signup" className="font-semibold text-green-700">
                    худалдан авагчаар бүртгүүлнэ үү
                  </Link>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
