import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { CATEGORIES, CATEGORY_KEYS, UB_DISTRICTS } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    category?: string;
    district?: string;
    q?: string;
  };
};

export default async function ListingsPage({ searchParams }: Props) {
  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.district) where.pickupDistrict = searchParams.district;
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const hasFilters = !!(
    searchParams.category ||
    searchParams.district ||
    searchParams.q
  );

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const s = params.toString();
    return s ? `/listings?${s}` : "/listings";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Зарууд</h1>
          <p className="mt-1 text-sm text-stone-600">
            Хугацаа дуусах дөхсөн / илүүдэл бараа · Улаанбаатар
          </p>
        </div>
        <p className="text-sm font-medium text-stone-500">
          {listings.length} зар
        </p>
      </div>

      <form className="card mt-6 grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="q">
            Хайх
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchParams.q || ""}
            className="input"
            placeholder="Жишээ: сүү, талх..."
          />
        </div>
        <div>
          <label className="label" htmlFor="category">
            Ангилал
          </label>
          <select
            id="category"
            name="category"
            defaultValue={searchParams.category || ""}
            className="input"
          >
            <option value="">Бүгд</option>
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="district">
            Дүүрэг
          </label>
          <select
            id="district"
            name="district"
            defaultValue={searchParams.district || ""}
            className="input"
          >
            <option value="">Бүгд</option>
            {UB_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 sm:col-span-4">
          <button type="submit" className="btn-primary">
            Шүүх
          </button>
          <Link href="/listings" className="btn-secondary">
            Цэвэрлэх
          </Link>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={buildHref({ category: undefined })}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            !searchParams.category
              ? "bg-green-600 text-white"
              : "bg-stone-200 text-stone-700 hover:bg-stone-300"
          }`}
        >
          Бүгд
        </Link>
        {CATEGORY_KEYS.map((k) => (
          <Link
            key={k}
            href={buildHref({ category: k })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              searchParams.category === k
                ? "bg-green-600 text-white"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            {CATEGORIES[k]}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={hasFilters ? "🔍" : "🛒"}
          title={
            hasFilters
              ? "Тохирох зар олдсонгүй"
              : "Одоогоор идэвхтэй зар байхгүй"
          }
          description={
            hasFilters
              ? "Шүүлтүүрээ өөрчилж эсвэл цэвэрлээд дахин үзнэ үү."
              : "Худалдагчид удахгүй зарууд нэмнэ. Та бүртгүүлээд эхний зар оруулж болно."
          }
          actionHref={hasFilters ? "/listings" : "/signup"}
          actionLabel={hasFilters ? "Шүүлтүүр цэвэрлэх" : "Бүртгүүлэх"}
        />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
