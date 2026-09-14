import Link from "next/link";
import { CATEGORIES, formatDate, formatMNT } from "@/lib/constants";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    category: string;
    originalPrice: number;
    discountPrice: number;
    quantity: number;
    unit: string;
    expiryDate: Date | string;
    pickupDistrict: string;
    photoUrl: string | null;
    status?: string;
  };
  href?: string;
};

export function ListingCard({ listing, href }: ListingCardProps) {
  const cat =
    CATEGORIES[listing.category as keyof typeof CATEGORIES] || listing.category;
  const discount = Math.round(
    (1 - listing.discountPrice / listing.originalPrice) * 100
  );

  return (
    <Link
      href={href || `/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-stone-100">
        {listing.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.photoUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🥬
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
          −{discount}%
        </span>
        {listing.status && listing.status !== "ACTIVE" && (
          <span className="absolute right-2 top-2 rounded-full bg-stone-800/80 px-2 py-0.5 text-xs text-white">
            {listing.status}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-green-700">
          {cat}
        </p>
        <h3 className="line-clamp-2 font-semibold text-stone-900 group-hover:text-green-700">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-green-700">
            {formatMNT(listing.discountPrice)}
          </span>
          <span className="text-sm text-stone-400 line-through">
            {formatMNT(listing.originalPrice)}
          </span>
        </div>
        <p className="text-xs text-stone-500">
          {listing.quantity} {listing.unit} · {listing.pickupDistrict} · дуусах:{" "}
          {formatDate(listing.expiryDate)}
        </p>
      </div>
    </Link>
  );
}
