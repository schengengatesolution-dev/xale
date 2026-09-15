import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/constants";
import { SellerNav } from "@/components/SellerNav";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function SellerInterestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  const interests = await prisma.interest.findMany({
    where: { listing: { sellerId: session.id } },
    include: {
      buyer: {
        select: { name: true, phone: true, whatsapp: true, email: true },
      },
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Ирсэн сонирхол</h1>
      <p className="mt-1 text-sm text-stone-600">
        Худалдан авагчдын «Сонирхож байна» зурвасууд
      </p>

      <div className="mt-6">
        <SellerNav active="/seller/interests" />
      </div>

      {interests.length === 0 ? (
        <EmptyState
          icon="💬"
          title="Одоогоор сонирхол байхгүй"
          description="Зар идэвхтэй байхад худалдан авагчид «Сонирхож байна» илгээнэ. Утас/WhatsApp-аа зөв оруулсан эсэхээ шалгаарай."
          actionHref="/seller/listings"
          actionLabel="Миний зарууд"
        />
      ) : (
        <ul className="space-y-4">
          {interests.map((i) => (
            <li key={i.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/listings/${i.listing.id}`}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    {i.listing.title}
                  </Link>
                  <p className="mt-1 text-xs text-stone-500">
                    {formatDate(i.createdAt)} · {i.buyer.name}
                  </p>
                </div>
                <div className="text-right text-sm">
                  {i.buyer.phone && (
                    <a
                      href={`tel:${i.buyer.phone}`}
                      className="block font-semibold text-green-700"
                    >
                      {i.buyer.phone}
                    </a>
                  )}
                  {i.buyer.whatsapp && (
                    <a
                      href={`https://wa.me/976${i.buyer.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-green-700 hover:underline"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                {i.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
