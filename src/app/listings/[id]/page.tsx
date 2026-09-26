import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isCheckoutEnabled } from "@/lib/qpay";
import {
  formatMNT,
  formatPickupWindow,
  savingsPercent,
} from "@/lib/constants";
import { ReserveForm } from "@/components/ReserveForm";
import { PayCheckout } from "@/components/PayCheckout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createT, getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const t = createT(getLocale());
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
  const catRaw = t(`categories.${listing.category}`);
  const cat =
    catRaw === `categories.${listing.category}` ? listing.category : catRaw;
  const discount = savingsPercent(
    listing.bagPrice,
    listing.estimatedRetailValue
  );
  const statusRaw = t(`statuses.${listing.status}`);
  const statusLabel =
    statusRaw === `statuses.${listing.status}` ? listing.status : statusRaw;

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
        {t("listingDetail.back")}
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
              <span className="text-sm font-medium">
                {t("listingDetail.luckyBag")}
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            {cat}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-coral-400">
            {t("listingDetail.luckyBag")}
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
              <dt className="text-stone-500">{t("listingDetail.remaining")}</dt>
              <dd className="font-semibold">{listing.quantityAvailable}</dd>
            </div>
            <div className="rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">{t("listingDetail.status")}</dt>
              <dd className="font-semibold">{statusLabel}</dd>
            </div>
            <div className="col-span-2 rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">{t("listingDetail.pickupWindow")}</dt>
              <dd className="font-semibold">
                {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
              </dd>
            </div>
            <div className="col-span-2 rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">{t("listingDetail.location")}</dt>
              <dd className="font-semibold">
                {listing.pickupDistrict}
                {listing.pickupAddress ? ` · ${listing.pickupAddress}` : ""}
              </dd>
            </div>
          </dl>

          {listing.dietaryNotes && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              <strong>{t("listingDetail.notes")}</strong> {listing.dietaryNotes}
            </p>
          )}

          <div className="mt-6">
            <h2 className="font-semibold">{t("listingDetail.description")}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
              {listing.description}
            </p>
            <p className="mt-2 text-xs text-stone-500">
              {t("listingDetail.secretNote")}
            </p>
          </div>

          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs leading-relaxed text-green-900">
            {t("listingDetail.bagNote")}
          </p>

          <div className="card mt-6">
            <h2 className="font-semibold">{t("listingDetail.business")}</h2>
            <p className="mt-1 text-stone-800">{listing.seller.name}</p>
            {listing.seller.phone && (
              <p className="mt-2 text-sm">
                {t("listingDetail.phone")}:{" "}
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
              <h2 className="mb-3 font-semibold">{t("listingDetail.reserve")}</h2>
              {alreadyReserved ? (
                <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
                  <p>
                    {t("listingDetail.alreadyReserved")}
                    {unpaidReservationId
                      ? t("listingDetail.payToConfirm")
                      : paidPickupCode
                        ? ""
                        : t("listingDetail.goPickup")}
                  </p>
                  {paidPickupCode && (
                    <div className="mt-3 rounded-2xl border-2 border-green-600 bg-white px-4 py-5 text-center shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                        {t("listingDetail.pickupCode")}
                      </p>
                      <p className="mt-2 select-all font-mono text-5xl font-black tracking-[0.2em] text-green-800 sm:text-6xl">
                        {paidPickupCode}
                      </p>
                      <p className="mt-3 text-sm font-medium leading-snug text-stone-700">
                        {t("listingDetail.showCode")}
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
                  {t("listingDetail.sellerCant")}
                </p>
              ) : (
                <p className="text-sm text-stone-600">
                  {t("listingDetail.loginToReserve")}{" "}
                  <Link href="/login" className="font-semibold text-green-700">
                    {t("listingDetail.login")}
                  </Link>{" "}
                  {t("listingDetail.or")}{" "}
                  <Link href="/signup" className="font-semibold text-green-700">
                    {t("listingDetail.signupBuyer")}
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
