import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  CATEGORIES,
  formatDate,
  formatMNT,
  STATUSES,
} from "@/lib/constants";
import { InterestForm } from "@/components/InterestForm";
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
  const discount = Math.round(
    (1 - listing.discountPrice / listing.originalPrice) * 100
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/listings" className="text-sm text-green-700 hover:underline">
        ← Зарууд руу буцах
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
            <div className="flex aspect-square items-center justify-center text-6xl">
              🥬
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            {cat}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{listing.title}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-green-700">
              {formatMNT(listing.discountPrice)}
            </span>
            <span className="text-lg text-stone-400 line-through">
              {formatMNT(listing.originalPrice)}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              −{discount}%
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Тоо хэмжээ</dt>
              <dd className="font-semibold">
                {listing.quantity} {listing.unit}
              </dd>
            </div>
            <div className="rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Дуусах огноо</dt>
              <dd className="font-semibold">{formatDate(listing.expiryDate)}</dd>
            </div>
            <div className="rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Авах байршил</dt>
              <dd className="font-semibold">{listing.pickupDistrict}</dd>
            </div>
            <div className="rounded-xl bg-stone-100 p-3">
              <dt className="text-stone-500">Төлөв</dt>
              <dd className="font-semibold">
                {STATUSES[listing.status as keyof typeof STATUSES] ||
                  listing.status}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="font-semibold">Тайлбар</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
              {listing.description}
            </p>
          </div>

          <div className="card mt-6">
            <h2 className="font-semibold">Худалдагч</h2>
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

          {listing.status === "ACTIVE" && (
            <div className="card mt-4">
              <h2 className="mb-3 font-semibold">Сонирхож байна</h2>
              {session?.role === "BUYER" ? (
                <InterestForm listingId={listing.id} />
              ) : session?.role === "SELLER" ? (
                <p className="text-sm text-stone-500">
                  Худалдагч сонирхол илгээх боломжгүй.
                </p>
              ) : (
                <p className="text-sm text-stone-600">
                  Сонирхол илгээхийн тулд{" "}
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
