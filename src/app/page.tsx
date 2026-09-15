import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    step: "1",
    title: "Ол",
    text: "Ойролцоох Азтай уутнуудыг дүүрэг, ангиллаар шүүж олно.",
  },
  {
    step: "2",
    title: "Захиал",
    text: "Reserve товчоор нөөцлөнө. Апп доторх төлбөр удахгүй — одоо авах үедээ төлнө.",
  },
  {
    step: "3",
    title: "Ав",
    text: "Тохирсон авах цонхонд дэлгүүр / ресторан / кафе дээр очиж авна.",
  },
  {
    step: "4",
    title: "Хаягдал↓",
    text: "Хямд үнээр авч, хоолны хаягдал багасгана — агуулга нууц, өөрчлөгдөнө.",
  },
];

export default async function HomePage() {
  const session = await getSession();

  let featured: Array<{
    id: string;
    title: string;
    category: string;
    bagPrice: number;
    estimatedRetailValue: number;
    quantityAvailable: number;
    pickupStart: Date;
    pickupEnd: Date;
    pickupDistrict: string;
    photoUrl: string | null;
    status: string;
    seller: { name: string } | null;
  }> = [];
  try {
    featured = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: { seller: { select: { name: true } } },
      orderBy: { pickupStart: "asc" },
      take: 6,
    });
  } catch {
    featured = [];
  }

  return (
    <div>
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
            Улаанбаатар · Азтай уут
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Сайн хоолыг{" "}
            <span className="text-cream-200">хаягдахаас</span> авар —
            Азтай уут
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-green-100">
            Ойролцоох бизнесийн <strong>Азтай уут</strong>-ыг{" "}
            <strong>ол</strong> → <strong>захиал</strong> → <strong>ав</strong>.
            Ангилал тодорхой, яг агуулга нь нууц!
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session ? (
              <Link
                href={session.role === "SELLER" ? "/seller" : "/listings"}
                className="rounded-xl bg-cream-100 px-6 py-3.5 text-sm font-bold text-green-800 shadow-lg hover:bg-white"
              >
                {session.role === "SELLER" ? "Самбар руу" : "Ойролцоох уутнууд"}
              </Link>
            ) : (
              <>
                <Link
                  href="/listings"
                  className="rounded-xl bg-cream-100 px-6 py-3.5 text-sm font-bold text-green-800 shadow-lg hover:bg-white"
                >
                  Ойролцоох Азтай уут ол
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
              <p className="text-2xl font-bold text-white">3 алхам</p>
              <p>ол → захиал → ав</p>
            </div>
            <div className="hidden h-10 w-px bg-white/20 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">Төлбөр офлайн</p>
              <p>Апп доторх төлбөр удахгүй</p>
            </div>
            <div className="hidden h-10 w-px bg-white/20 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">УБ дүүргүүд</p>
              <p>Авах цонх · дүүрэг шүүнэ</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200/70 bg-cream-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
                Хэрхэн ашиглах вэ?
              </p>
              <h2 className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl">
                ол → захиал → ав
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Азтай уут — 3 алхам (+ хаягдал↓)
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

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                Ойролцоох Азтай уут
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Идэвхтэй уутнууд · Улаанбаатар
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            Яагаад xale вэ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">
            Талхны дэлгүүр, кафе, ресторан, зочид буудал, хүнсний дэлгүүрүүд
            өдөр бүр илүүдэл хоол үлдээдэг. <strong>Азтай уут</strong>-аар
            энэ хоолыг хямд үнээр хэрэглэгчидэд хүргэнэ — хаягдал буурна.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🛍️",
                title: "Азтай уут",
                text: "Ангилал тодорхой, яг агуулга нь өдөр бүр өөр — нууц!",
              },
              {
                icon: "⏰",
                title: "Авах цонх",
                text: "Захиалсны дараа тохирсон цагт очиж авна — нөөцлөгдөнө.",
              },
              {
                icon: "🌍",
                title: "Хаягдал↓",
                text: "Сайн хоол хаягдахгүй. Худалдагч, худалдан авагч хоёулаа хожно.",
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
          <p className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs leading-relaxed text-amber-950">
            <strong>Хүнсний аюулгүй байдал:</strong> Азтай уутны агуулга
            өөрчлөгдөж болно. Харшил / хоолны хязгаарлалт байвал захиалахаасаа
            өмнө бизнестэй холбогдоорой. xale нь зуучлагч платформ.
          </p>
        </div>
      </section>

      <section className="bg-cream-200/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Худалдан авагч · Бизнес
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card border-green-200 bg-green-50/70">
              <h3 className="text-xl font-bold text-green-800">Худалдан авагч</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Ойролцоох Азтай уут
                  ол
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Захиал (нөөцлө)
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Ав — хямд үнэ
                </li>
              </ul>
              <Link href="/listings" className="btn-primary mt-6 inline-flex">
                Уутнууд үзэх
              </Link>
            </div>
            <div className="card border-green-200/80 bg-white">
              <h3 className="text-xl font-bold text-green-800">Бизнес</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Талх, кафе, ресторан,
                  буудал, дэлгүүр
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Азтай уут үүсгэ —
                  одоо <strong>шимтгэлгүй</strong>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span> Захиалга хүлээн авч
                  «Авсан» тэмдэглэ
                </li>
              </ul>
              {!session ? (
                <Link href="/signup" className="btn-primary mt-6 inline-flex">
                  Бизнесээр бүртгүүлэх
                </Link>
              ) : session.role === "SELLER" ? (
                <Link href="/seller" className="btn-primary mt-6 inline-flex">
                  Самбар руу
                </Link>
              ) : (
                <Link
                  href="/payment-terms"
                  className="btn-secondary mt-6 inline-flex"
                >
                  Төлбөрийн нөхцөл
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-900 py-16 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">Одоо эхлээрэй</h2>
        <p className="mx-auto mt-3 max-w-md text-green-100">
          Азтай уутаараа сайн хоолыг хаягдахаас авар. Утаснаасаа «Нүүр
          дэлгэцэд нэмэх»-ээр апп шиг ашиглана.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!session ? (
            <>
              <Link
                href="/listings"
                className="inline-block rounded-xl bg-cream-100 px-8 py-3.5 text-sm font-bold text-green-800 hover:bg-white"
              >
                Азтай уут ол
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
