import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Хэрхэн ажилладаг вэ?",
  description:
    "xale: ойролцоох илүүдэл бараа ол → сонирхол → дэлгүүрт очиж ав. Хоолны хаягдал бууруулна.",
};

const STEPS = [
  {
    step: "НЭГ",
    num: "1",
    title: "Ол",
    detail:
      "Зарууд хуудаснаас дүүрэг, ангиллаар шүүж ойролцоох илүүдэл / хугацаа дуусах дөхсөн барааг харна.",
  },
  {
    step: "ХОЁР",
    num: "2",
    title: "Захиалаа / Сонирхол",
    detail:
      "«Сонирхож байна» илгээнэ. Худалдагч таны утас / WhatsApp-ыг харна. (Одоогоор апп дотор төлбөр байхгүй — офлайн тохиролцоо.)",
  },
  {
    step: "ГУРАВ",
    num: "3",
    title: "Авчрах цагт очиж аваарай",
    detail:
      "Тохирсон цагт зарын авах байршил (дэлгүүр / ресторан) дээр очиж бараагаа авна. Төлбөр бэлэн эсвэл шилжүүлгээр.",
  },
  {
    step: "ДӨРӨВ",
    num: "4",
    title: "Хоолны хаягдал бууруул",
    detail:
      "Хямд үнээр авч, хоолны хаягдал багасгана. Худалдагч илүүдлээ зарж, худалдан авагч хэмнэнэ — гаригт ч сайн.",
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
          4 алхам — ол → ав → хаягдал↓
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          <strong className="text-green-700">xale</strong> нь Too Good To Go шиг:
          ойролцоох илүүдэл хүнсийг олж, сонирхол илгээж, дэлгүүрт очиж авна.
          Апп доторх төлбөргүй (одоо) — талууд офлайн тохиролцоно.
        </p>

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

        <section className="mt-10 rounded-3xl border border-green-200 bg-green-50/70 p-6">
          <h2 className="text-lg font-bold text-green-800">Худалдагчдад</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Зар оруулах <strong>үнэгүй</strong>. Ирээдүйд амжилтын шимтгэл ~3% болон
            сонголттой VIP байршуулалт төлөвлөгдсөн — одоо идэвхгүй.{" "}
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
            Сайтыг утасны нүүр дэлгэцэд нэмж апп шиг ашиглана. App Store / Play
            Store-ын native апп (Expo) болон xale.mn домэйн — дараагийн шат.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/listings" className="btn-primary !px-8 !py-3.5">
            Зарууд ол
          </Link>
          <Link href="/signup" className="btn-secondary !px-8 !py-3.5">
            Бүртгүүлэх
          </Link>
        </div>
      </div>
    </div>
  );
}
