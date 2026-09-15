import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ListingForm } from "@/components/ListingForm";
import { SellerNav } from "@/components/SellerNav";
import Link from "next/link";

export default async function NewListingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/seller/listings"
        className="text-sm text-green-700 hover:underline"
      >
        ← Миний Азтай уут
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Шинэ Азтай уут</h1>
      <div className="mt-6">
        <SellerNav active="/seller/listings/new" />
      </div>
      <ListingForm mode="create" />
    </div>
  );
}
