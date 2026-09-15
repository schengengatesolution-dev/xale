import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  let featured: Awaited<ReturnType<typeof prisma.listing.findMany>> = [];
  try {
    featured = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    featured = [];
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-600 to-emerald-500 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 60%, #fbbf24 0%, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-50 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Улаанбаатар · Бэлэн ажиллагаа
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Илүүдэл бараа{" "}
            <span className="text-amber-300">хаягдахгүй</span> — хэрэгтэй хүнд
            очно
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-green-50">
            <strong>xale</strong> нь дэлгүүр, рестораны хугацаа дуусах дөхсөн,
            илүүдэл хүнсийг худалдан авагч, ферм, бөөний худалдан авагчтай
            шууд холбодог.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session ? (
              <Link
                href={
                  session.role === "SELLER" ? "/seller" : "/listings"
                }
                className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-green-800 shadow-lg hover:bg-green-50"
              >
                {session.role === "SELLER" ? "Самбар руу" : "Зарууд үзэх"}
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-stone-900 shadow-lg hover:bg-amber-300"
                >
                  Үнэгүй бүртгүүлэх
                </Link>
                <Link
                  href="/listings"
                  className="rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-white/20"
                >
                  Зарууд үзэх
                </Link>
              </>
            )}
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-green-50/90">
            <div>
              <p className="text-2xl font-bold text-white">3 алхам</p>
              <p>Бүртгэл → зар → холбоо</p>
            </div>
            <div className="hidden h-10 w-px bg-white/25 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">Төлбөргүй</p>
              <p>MVP — шууд холбогдоно</p>
            </div>
            <div className="hidden h-10 w-px bg-white/25 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">УБ дүүргүүд</p>
              <p>Авах байршил шүүнэ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                Сүүлийн зарууд
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Одоо идэвхтэй байгаа илүүдэл / near-expiry бараа
              </p>
            </div>
            <Link
              href="/listings"
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              Бүгдийг үзэх →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Problem */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            Яагаад xale вэ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">
            Улаанбаатарт өдөр бүр дэлгүүр, ресторанууд хугацаа дуусах дөхсөн эсвэл
            илүүдэл хүнсээ хаядаг. Нөгөө талд хүмүүс, фермүүд хямд, хэрэгтэй бараа
            хайж байна. <strong>xale</strong> энэ хоёрыг холбоно.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🗑️",
                title: "Хаягдал багасгана",
                text: "Хугацаа дууссан бараа хог болохын өмнө хэрэгтэй хүнд очно.",
              },
              {
                icon: "💸",
                title: "Хямд үнэ",
                text: "Худалдан авагчид хямдралтай үнээр авч, мөнгө хэмнэнэ.",
              },
              {
                icon: "📱",
                title: "Шууд холбоо",
                text: "Утас / WhatsApp-аар тохиролцоно — төлбөрийн системгүй.",
              },
            ].map((item) => (
              <div key={item.title} className="card text-center">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Хэрхэн ажилладаг вэ?
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Бүртгүүлэх",
              text: "Худалдагч эсвэл худалдан авагчаар 1 минутад бүртгүүлнэ.",
            },
            {
              step: "2",
              title: "Зар оруулах / хайх",
              text: "Худалдагч илүүдэл бараагаа зарлана. Худалдан авагч шүүж харна.",
            },
            {
              step: "3",
              title: "Холбогдох",
              text: "«Сонирхож байна» илгээж, утас/WhatsApp-аар тохиролцоно.",
            },
          ].map((s) => (
            <div key={s.step} className="relative card">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow-sm">
                {s.step}
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section className="bg-stone-100/80 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Хэнд зориулагдсан вэ?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card border-green-200 bg-green-50/60">
              <h3 className="text-xl font-bold text-green-800">Худалдагч</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Тохиромжтой дэлгүүр,
                  мини маркет
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Ресторан, кафе,
                  талхны дэлгүүр
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Илүүдэл / дуусах дөхсөн
                  бараатай аж ахуй
                </li>
              </ul>
              {!session && (
                <Link
                  href="/signup"
                  className="btn-primary mt-6 inline-flex"
                >
                  Худалдагчаар бүртгүүлэх
                </Link>
              )}
            </div>
            <div className="card border-amber-200 bg-amber-50/60">
              <h3 className="text-xl font-bold text-amber-900">Худалдан авагч</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-amber-600">✓</span> Хямд хүнс хайж буй
                  иргэд
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600">✓</span> Гахайн ферм, мал аж
                  ахуй
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600">✓</span> Бөөний худалдан авагч,
                  байгууллага
                </li>
              </ul>
              <Link href="/listings" className="btn-secondary mt-6 inline-flex">
                Зарууд үзэх
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-16 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">Одоо эхлээрэй</h2>
        <p className="mx-auto mt-3 max-w-md text-stone-300">
          Илүүдэл бараагаа хаялгүй, хэрэгтэй хүнд очих боломжийг{" "}
          <strong className="text-green-400">xale</strong>-ээр нээнэ үү.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!session ? (
            <>
              <Link
                href="/signup"
                className="inline-block rounded-xl bg-green-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-green-400"
              >
                Бүртгүүлэх
              </Link>
              <Link
                href="/login"
                className="inline-block rounded-xl border border-stone-600 px-8 py-3.5 text-sm font-semibold text-stone-200 hover:bg-stone-800"
              >
                Нэвтрэх
              </Link>
            </>
          ) : (
            <Link
              href={session.role === "SELLER" ? "/seller" : "/listings"}
              className="inline-block rounded-xl bg-green-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-green-400"
            >
              Үргэлжлүүлэх
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
