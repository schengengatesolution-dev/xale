import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Төлбөрийн нөхцөл · Хайран",
  description:
    "Хайран Азтай уут: QPay-ээр төлж, авах кодоор авна. Баасан гаригт дэлгүүрийн данс.",
};

export default function PaymentTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Төлбөрийн нөхцөл
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Сүүлийн шинэчлэл: 2026-09-26 · <strong className="text-stone-700">Хайран</strong>
      </p>

      <div className="prose-xale mt-10 space-y-8 text-stone-700">
        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">1. Худалдан авагч</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Азтай уутыг <strong>QPay</strong>-ээр бүрэн төлж захиална.
            </li>
            <li>
              Төлбөр амжилттай болсны дараа <strong>авах код</strong> харагдана.
            </li>
            <li>
              Дэлгүүрт очиж кодыг хэлнэ — кодгүйгээр уут өгөхгүй.
            </li>
            <li>Төлбөр / хүргэлтийн нэмэлт төлбөр байхгүй.</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">2. Дэлгүүр</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>Азтай уут нийтлэх үнэгүй.</li>
            <li>
              Бүртгэлдээ <strong>банкны данс</strong> оруулна (
              <Link href="/seller/settings" className="font-semibold text-green-700">
                /seller/settings
              </Link>
              ).
            </li>
            <li>
              Пүрэв 23:59:59 (Улаанбаатар) хүртэлх баталгаажсан захиалгыг нэгтгэж,{" "}
              <strong>Баасан гаригт</strong> таны данс руу шилжүүлнэ.
            </li>
            <li>Пүрэв шөнөөрөөс хойшхи борлуулалт дараагийн Баасан багцад орно.</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">3. Азтай уут</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>Ангилал тодорхой — доторх зүйлийг сонгохгүй (гайхшрал).</li>
            <li>Үнэ жижиглэнгийн ойролцоогоор 3× хямд.</li>
            <li>Хоолны чанар, хадгалалтыг дэлгүүр хариуцна.</li>
          </ul>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/map" className="btn-primary">
          Газрын зураг
        </Link>
        <Link href="/how-it-works" className="btn-secondary">
          Хэрхэн ажилладаг вэ?
        </Link>
      </div>
    </div>
  );
}
