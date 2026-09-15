import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/ListingForm";
import { SellerNav } from "@/components/SellerNav";
import { toLocalInputValue } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
  });
  if (!listing || listing.sellerId !== session.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/seller/listings"
        className="text-sm text-green-700 hover:underline"
      >
        ← Миний Азтай уут
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Азтай уут засах</h1>
      <div className="mt-6">
        <SellerNav active="/seller/listings" />
      </div>
      <div className="mt-6">
        <ListingForm
          mode="edit"
          initial={{
            id: listing.id,
            title: listing.title,
            category: listing.category,
            description: listing.description,
            bagPrice: listing.bagPrice,
            estimatedRetailValue: listing.estimatedRetailValue,
            quantityAvailable: listing.quantityAvailable,
            pickupStart: toLocalInputValue(listing.pickupStart),
            pickupEnd: toLocalInputValue(listing.pickupEnd),
            pickupDistrict: listing.pickupDistrict,
            pickupAddress: listing.pickupAddress || "",
            dietaryNotes: listing.dietaryNotes || "",
            photoUrl: listing.photoUrl || "",
            status: listing.status,
          }}
        />
      </div>
    </div>
  );
}
