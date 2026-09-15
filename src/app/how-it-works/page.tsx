import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Хэрхэн ажилладаг вэ?",
  description:
    "xale Азтай уут: ол → захиал → ав. Улаанбаатар.",
};

const STEPS = [
  {
    step: "НЭГ",
    num: "1",
    title: "Ол",
    detail:
      "Зарууд хуудаснаас дүүрэг, ангиллаар шүүж ойролцоох Азтай уутнуудыг харна. Ангилал (талх, кафе, ресторан…) тодорхой — яг агуулгыг сонгохгүй, гайхшрал!",
  },
  {
    step: "ХОЁР",
    num: "2",
    title: "Захиал",
    detail:
      "«Захиалах · Reserve» товчоор уутыг нөөцлөнө. Одоогоор апп дотор карт төлбөргүй — төлбөрийг авах үедээ хийнэ. Апп доторх төлбөр удахгүй нэмэгдэнэ.",
  },
  {
    step: "ГУРАВ",
    num: "3",
    title: "Ав",
    detail:
      "Тохирсон авах цонхонд бизнес дээр очиж Азтай уутаа авна. Худалдагч «Авсан» гэж тэмдэглэнэ. Ирээгүй бол No-show.",
  },
  {
    step: "ДӨРӨВ",
    num: "4",
    title: "Хаягдал бууруул",
    detail:
      "Жижиглэнгийн ойролцоогоор ⅓ үнээр авч, сайн хоолыг хаягдахаас аварна. Агуулга өдөр бүр өөрчлөгдөж болно.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-cream-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
          Хэрхэн ашиглах вэ?
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-green-600 sm:text-4xl">
          ол → захиал → ав
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          <strong className="text-green-700">xale</strong> бизнесийн илүүдэл
          хоолыг <strong>Азтай уут</strong> болгон хэрэглэгчдэд холбоно.
          Гол урсгал: <strong>ол</strong> → <strong>захиал</strong> →{" "}
          <strong>ав</strong>. (Хаягдал бууруулах — нэмэлт үр дүн.)
        </p>

        <section className="mt-8 rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-green-800">
            Азтай уут гэж юу вэ?
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-stone-700">
            <li className="flex gap-2">
              <span className="shrink-0 font-bold text-green-600">1.</span>
              <span>
                <strong>Ангилал тодорхой</strong> — талх / нарийн боов, хүнсний
                дэлгүүр, ресторан, кафе, зочид буудал гэх мэт.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-bold text-green-600">2.</span>
              <span>
                <strong>Яг агуулгыг сонгохгүй</strong> — доторх зүйл гайхшрал;
                өдөр бүр өөрчлөгдөж болно.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 font-bold text-green-600">3.</span>
              <span>
                Тиймээс үнэ нь жижиглэнгийн ойролцоогоор{" "}
                <strong>3 дахин хямд</strong> (~⅓). Жишээ: ~15,000₮ үнэ цэнэ →
                ~5,000₮ Азтай уут.
              </span>
            </li>
          </ul>
        </section>

        <ol className="mt-10 space-y-5">
          {STEPS.map((s) => (
            <li
              key={s.num}
              className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
                <div className="shrink-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-400">
                    Алхам {s.step}
                  </p>
                  <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                    {s.num}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-green-600">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                    {s.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-950">
            Хүнсний аюулгүй байдал
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
            Азтай уутны агуулга өөрчлөгдөж болно. Харшил эсвэл хоолны
            хязгаарлалт байвал захиалахаасаа өмнө бизнестэй холбогдоорой. xale
            нь зуучлагч — хоолны чанарыг бизнес өөрөө хариуцна.
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-green-200 bg-green-50/70 p-6">
          <h2 className="text-lg font-bold text-green-800">Бизнесүүдэд</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Азтай уут оруулах <strong>үнэгүй</strong>. Ирээдүйд гүйлгээний
            шимтгэл (төсөл) — одоо идэвхгүй.{" "}
            <Link
              href="/payment-terms"
              className="font-semibold text-green-700 hover:underline"
            >
              Төлбөрийн нөхцөл
            </Link>
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold text-green-800">Утасны апп (PWA v1)</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Сайтыг утасны нүүр дэлгэцэд нэмж апп шиг ашиглана. Native апп болон
            xale.mn — дараагийн шат.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/listings" className="btn-primary !px-8 !py-3.5">
            Азтай уут ол
          </Link>
          <Link href="/signup" className="btn-secondary !px-8 !py-3.5">
            Бүртгүүлэх
          </Link>
        </div>
      </div>
    </div>
  );
}
