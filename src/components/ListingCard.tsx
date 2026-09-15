import Link from "next/link";
import {
  CATEGORIES,
  formatMNT,
  formatPickupWindow,
  pickupUrgencyLabel,
  daysUntil,
  savingsPercent,
  STATUSES,
} from "@/lib/constants";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    category: string;
    bagPrice: number;
    estimatedRetailValue: number;
    quantityAvailable: number;
    pickupStart: Date | string;
    pickupEnd: Date | string;
    pickupDistrict: string;
    photoUrl: string | null;
    status?: string;
    seller?: { name: string } | null;
  };
  href?: string;
};

export function ListingCard({ listing, href }: ListingCardProps) {
  const cat =
    CATEGORIES[listing.category as keyof typeof CATEGORIES] || listing.category;
  const discount = savingsPercent(
    listing.bagPrice,
    listing.estimatedRetailValue
  );
  const days = daysUntil(listing.pickupEnd);
  const urgent = days >= 0 && days <= 1;
  const statusLabel =
    listing.status && listing.status !== "ACTIVE"
      ? STATUSES[listing.status as keyof typeof STATUSES] || listing.status
      : null;

  return (
    <Link
      href={href || `/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-green-50 to-stone-50">
        {listing.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.photoUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-stone-400">
            <span className="text-4xl">🛍️</span>
            <span className="text-xs font-medium">Surprise Bag</span>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
            −{discount}%
          </span>
        )}
        {statusLabel && (
          <span className="absolute right-2 top-2 rounded-full bg-stone-800/80 px-2 py-0.5 text-xs text-white">
            {statusLabel}
          </span>
        )}
        {urgent && !statusLabel && (
          <span className="absolute bottom-2 left-2 rounded-full bg-coral-400 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {pickupUrgencyLabel(listing.pickupEnd)}
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-green-900/80 px-2.5 py-0.5 text-xs font-semibold text-cream-100 backdrop-blur">
          {listing.quantityAvailable} уут үлдсэн
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            {cat}
          </p>
          {listing.seller?.name && (
            <p className="truncate text-xs text-stone-500">
              {listing.seller.name}
            </p>
          )}
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-coral-400">
          Surprise Bag
        </p>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900 group-hover:text-green-700">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-green-700">
            {formatMNT(listing.bagPrice)}
          </span>
          {listing.estimatedRetailValue > listing.bagPrice && (
            <span className="text-sm text-stone-400 line-through">
              {formatMNT(listing.estimatedRetailValue)}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-stone-500">
          <span className="font-medium text-stone-600">
            {listing.pickupDistrict}
          </span>
          {" · "}
          <span className={urgent ? "font-semibold text-coral-400" : ""}>
            {formatPickupWindow(listing.pickupStart, listing.pickupEnd)}
          </span>
        </p>
      </div>
    </Link>
  );
}
