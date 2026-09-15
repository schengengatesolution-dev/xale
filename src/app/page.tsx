import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    step: "1",
    title: "Ол",
    text: "Ойролцоох илүүдэл / хугацаа дуусах дөхсөн барааг заруудаас ол.",
  },
  {
    step: "2",
    title: "Захиалаа / Сонирхол",
    text: "«Сонирхож байна» илгээж нөөцлөнө — дэлгүүрт очихоосоо өмнө.",
  },
  {
    step: "3",
    title: "Авчрах цагт очиж аваарай",
    text: "Тохирсон цагт дэлгүүр / ресторан дээр очиж бараагаа авна.",
  },
  {
    step: "4",
    title: "Хоолны хаягдал бууруул",
    text: "Хямд үнээр авч, хоолны хаягдал багасгана — хүн бүр хожно.",
  },
];

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
      {/* Hero — calm forest, TGTG-like mission */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-[#005A57] to-green-600 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(247,244,239,0.35) 0%, transparent 42%), radial-gradient(circle at 85% 70%, rgba(31,92,69,0.5) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cream-100 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-cream-200" />
            Улаанбаатар · Surplus food
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Илүүдэл хоол{" "}
            <span className="text-cream-200">хаягдахгүй</span> — ойролцоох
            дэлгүүрт аваарай
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-green-100">
            <strong>xale</strong> нь Too Good To Go шиг: ойролцоох илүүдэл
            барааг <strong>ол</strong> → <strong>сонирхол</strong> илгээ →{" "}
            <strong>дэлгүүрт очиж ав</strong>. Хоолны хаягдал бууруулна.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session ? (
              <Link
                href={session.role === "SELLER" ? "/seller" : "/listings"}
                className="rounded-xl bg-cream-100 px-6 py-3.5 text-sm font-bold text-green-800 shadow-lg hover:bg-white"
              >
                {session.role === "SELLER" ? "Самбар руу" : "Ойролцоох зарууд"}
              </Link>
            ) : (
              <>
                <Link
                  href="/listings"
                  className="rounded-xl bg-cream-100 px-6 py-3.5 text-sm font-bold text-green-800 shadow-lg hover:bg-white"
                >
                  Ойролцоох зарууд ол
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-white/20"
                >
                  Үнэгүй бүртгүүлэх
                </Link>
              </>
            )}
            <Link
              href="/how-it-works"
              className="rounded-xl px-4 py-3.5 text-sm font-semibold text-cream-100/90 underline-offset-4 hover:underline"
            >
              Хэрхэн ажилладаг вэ?
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-green-100/90">
            <div>
              <p className="text-2xl font-bold text-white">4 алхам</p>
              <p>Ол → Сонирхол → Ав → Хаягдал↓</p>
            </div>
            <div className="hidden h-10 w-px bg-white/20 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">Үнэгүй зар</p>
              <p>Шимтгэлгүй · офлайн авна</p>
            </div>
            <div className="hidden h-10 w-px bg-white/20 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">УБ дүүргүүд</p>
              <p>Авах байршил шүүнэ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Numbered steps — TGTG how-it-works */}
      <section className="border-b border-stone-200/70 bg-cream-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
                Хэрхэн ашиглах вэ?
              </p>
              <h2 className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl">
                4 алхам — ол → ав
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Too Good To Go шиг: ол → захиалаа → очиж ав → хаягдал↓
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              Дэлгэрэнгүй →
            </Link>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.step} className="card relative overflow-hidden">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow-sm">
                  {s.step}
                </span>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-coral-400">
                  Алхам {s.step}
                </p>
                <h3 className="mt-1 text-xl font-bold uppercase tracking-tight text-green-600">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                Ойролцоох зарууд
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Одоо идэвхтэй илүүдэл / near-expiry бараа
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

      {/* Mission / why */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            Яагаад xale вэ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">
            Улаанбаатарт өдөр бүр дэлгүүр, ресторанууд хугацаа дуусах дөхсөн
            эсвэл илүүдэл хүнсээ хаядаг. Нөгөө талд хүмүүс хямд, хэрэгтэй бараа
            хайж байна. <strong>xale</strong> энэ хоёрыг холбоно.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🌍",
                title: "Хаягдал багасгана",
                text: "Хугацаа дууссан бараа хог болохын өмнө хэрэгтэй хүнд очно.",
              },
              {
                icon: "💰",
                title: "Хямд үнэ",
                text: "Худалдан авагчид хямдралтай үнээр авч, мөнгө хэмнэнэ.",
              },
              {
                icon: "🏪",
                title: "Дэлгүүрт очиж ав",
                text: "Сонирхол → тохирсон цагт авах цэг дээр — төлбөр офлайн.",
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

      {/* Audiences CTAs */}
      <section className="bg-cream-200/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Худалдан авагч · Худалдагч
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card border-green-200 bg-green-50/70">
              <h3 className="text-xl font-bold text-green-800">Худалдан авагч</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Ойролцоох илүүдэл
                  бараа ол
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Сонирхол илгээж
                  нөөцлө
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Дэлгүүрт очиж ав —
                  хямд үнэ
                </li>
              </ul>
              <Link href="/listings" className="btn-primary mt-6 inline-flex">
                Зарууд үзэх
              </Link>
            </div>
            <div className="card border-green-200/80 bg-white">
              <h3 className="text-xl font-bold text-green-800">Худалдагч</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Дэлгүүр, мини маркет,
                  ресторан
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Зар{" "}
                  <strong>үнэгүй</strong> · ирээдүйд 3%+VIP (төсөл)
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Сонирхол хүлээн авч
                  холбогд
                </li>
              </ul>
              {!session ? (
                <Link href="/signup" className="btn-primary mt-6 inline-flex">
                  Худалдагчаар бүртгүүлэх
                </Link>
              ) : session.role === "SELLER" ? (
                <Link href="/seller" className="btn-primary mt-6 inline-flex">
                  Самбар руу
                </Link>
              ) : (
                <Link href="/payment-terms" className="btn-secondary mt-6 inline-flex">
                  Төлбөрийн нөхцөл
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-900 py-16 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">Одоо эхлээрэй</h2>
        <p className="mx-auto mt-3 max-w-md text-green-100">
          Илүүдэл бараагаа хаялгүй, хэрэгтэй хүнд очих боломжийг{" "}
          <strong className="text-cream-100">xale</strong>-ээр нээнэ үү.
          Утаснаасаа «Нүүр дэлгэцэд нэмэх»-ээр апп шиг ашиглана.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!session ? (
            <>
              <Link
                href="/listings"
                className="inline-block rounded-xl bg-cream-100 px-8 py-3.5 text-sm font-bold text-green-800 hover:bg-white"
              >
                Зарууд ол
              </Link>
              <Link
                href="/signup"
                className="inline-block rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-cream-100 hover:bg-white/10"
              >
                Бүртгүүлэх
              </Link>
            </>
          ) : (
            <Link
              href={session.role === "SELLER" ? "/seller" : "/listings"}
              className="inline-block rounded-xl bg-cream-100 px-8 py-3.5 text-sm font-bold text-green-800 hover:bg-white"
            >
              Үргэлжлүүлэх
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
