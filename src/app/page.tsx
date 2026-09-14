import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-100">
            Улаанбаатар · MVP
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Илүүдэл бараа{" "}
            <span className="text-amber-300">хаягдахгүй</span> — хэрэгтэй хүнд
            очно
          </h1>
          <p className="mt-5 max-w-xl text-lg text-green-50">
            <strong>xale</strong> нь дэлгүүр, рестораны хугацаа дуусах дөхсөн,
            илүүдэл хүнсийг худалдан авагч, ферм, бөөний худалдан авагчтай
            шууд холбодог.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session ? (
              <Link
                href={
                  session.role === "SELLER" ? "/seller/listings" : "/listings"
                }
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 shadow hover:bg-green-50"
              >
                {session.role === "SELLER" ? "Миний зарууд" : "Зарууд үзэх"}
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-stone-900 shadow hover:bg-amber-300"
                >
                  Бүртгүүлэх
                </Link>
                <Link
                  href="/listings"
                  className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20"
                >
                  Зарууд үзэх
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-stone-900 sm:text-3xl">
          Асуудал
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
              title: "Хаягдал",
              text: "Хугацаа дууссан бараа хог болж, мөнгө алдагдана.",
            },
            {
              icon: "💸",
              title: "Үнэ өндөр",
              text: "Худалдан авагчид бүрэн үнээр авч, боломж алдана.",
            },
            {
              icon: "🔗",
              title: "Холбоогүй",
              text: "Худалдагч, авагч хоорондоо мэдээлэлгүй.",
            },
          ].map((item) => (
            <div key={item.title} className="card text-center">
              <div className="text-3xl">{item.icon}</div>
              <h3 className="mt-3 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Хэрхэн ажилладаг вэ?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Бүртгүүлэх",
                text: "Худалдагч эсвэл худалдан авагчаар бүртгүүлнэ.",
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
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Хэнд зориулагдсан вэ?
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card border-green-200 bg-green-50/50">
            <h3 className="text-xl font-bold text-green-800">Худалдагч</h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              <li>· Тохиромжтой дэлгүүр, мини маркет</li>
              <li>· Ресторан, кафе, талхны дэлгүүр</li>
              <li>· Илүүдэл / дуусах дөхсөн бараатай аж ахуй</li>
            </ul>
          </div>
          <div className="card border-amber-200 bg-amber-50/50">
            <h3 className="text-xl font-bold text-amber-800">Худалдан авагч</h3>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              <li>· Хямд хүнс хайж буй иргэд</li>
              <li>· Гахайн ферм, мал аж ахуй</li>
              <li>· Бөөний худалдан авагч, байгууллага</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-14 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">Одоо эхлээрэй</h2>
        <p className="mx-auto mt-3 max-w-md text-stone-300">
          Илүүдэл бараагаа хаялгүй, хэрэгтэй хүнд очих боломжийг{" "}
          <strong className="text-green-400">xale</strong>-ээр нээнэ үү.
        </p>
        {!session && (
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-white hover:bg-green-400"
          >
            Бүртгүүлэх
          </Link>
        )}
      </section>
    </div>
  );
}
