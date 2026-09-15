import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Төлбөрийн нөхцөл",
  description:
    "xale Surprise Bag платформын төлбөрийн нөхцөл — одоогоор идэвхгүй төсөл.",
};

export default function PaymentTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div
        role="status"
        className="mb-8 flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:gap-4"
      >
        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
          Төсөл
        </span>
        <div>
          <p className="text-sm font-bold text-amber-950">
            Одоогоор идэвхгүй — шимтгэл авдаггүй
          </p>
          <p className="mt-0.5 text-sm text-amber-900/80">
            Энэ хуудас нь ирээдүйн гүйлгээний шимтгэлийн төсөл юм. Өнөөдөр xale
            Surprise Bag захиалга / зар нийтлэлд ямар ч төлбөр авдаггүй.
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Төлбөрийн нөхцөл
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Сүүлийн шинэчлэл: 2026-09-15 ·{" "}
        <span className="font-medium text-stone-700">Төсөл / идэвхгүй</span>
      </p>

      <div className="prose-xale mt-10 space-y-8 text-stone-700">
        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            1. Платформын зорилго
          </h2>
          <p className="text-sm leading-relaxed">
            <strong>xale</strong> нь Улаанбаатарт илүүдэл хоолтой бизнес
            (талхны дэлгүүр, кафе, ресторан, зочид буудал, хүнсний дэлгүүр) болон
            хэрэглэгчдийг <strong>Surprise Bag</strong>-аар холбодог платформ
            юм. Ангилал тодорхой, яг агуулга нь Surprise. Бид зуучлагч —
            хоолыг өөрсдөө зардаггүй.
          </p>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            2. Одоогийн ажиллагаа (шимтгэлгүй)
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Surprise Bag оруулах: <strong>үнэгүй</strong>.
            </li>
            <li>
              Худалдан авагч уут олж, <strong>захиалана</strong> (нөөцлөнө).
            </li>
            <li>
              Авах цонхны хугацаанд бизнес дээр очиж авна. Төлбөр{" "}
              <strong>офлайн</strong> (бэлэн / шилжүүлэг).
            </li>
            <li>
              <strong>Апп доторх карт төлбөр</strong> одоогоор байхгүй —
              удахгүй нэмэгдэнэ.
            </li>
            <li>
              xale одоогоор ямар ч шимтгэл <strong>авдаггүй</strong>.
            </li>
          </ul>
        </section>

        <section className="card space-y-3 border-dashed border-stone-300 bg-stone-50/80">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900">
              3. Ирээдүйн загвар (төсөл)
            </h2>
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
              Идэвхжүүлээгүй
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Хэрэглэгчийн тоо нэмэгдсэний дараа гүйлгээний шимтгэлийг
            идэвхжүүлэх төлөвлөгөөтэй. <em>Одоо хэрэгжихгүй.</em>
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Surprise Bag оруулах: <strong>үнэгүй</strong> хэвээр.
            </li>
            <li>
              Амжилттай захиалга / цуглуулалтын дараа бизнесээс{" "}
              <strong>bag үнийн ~3%</strong> гүйлгээний шимтгэл (төсөл).
            </li>
            <li>
              Худалдан авагчаас платформын шимтгэл{" "}
              <strong>авахгүй</strong>.
            </li>
            <li>
              VIP / тусгай байршуулалт (сонголттой) — тогтмол төлбөр.
            </li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            4. Хүнсний аюулгүй байдал
          </h2>
          <p className="text-sm leading-relaxed">
            Surprise Bag-ийн агуулга өөрчлөгдөж болно. Харшил / хоолны
            хязгаарлалт байвал захиалахаасаа өмнө бизнестэй холбогдоорой. Хоолны
            чанар, хадгалалтыг бизнес хариуцна.
          </p>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            5. Анхааруулга / өөрчлөлт
          </h2>
          <p className="text-sm leading-relaxed">
            Эдгээр нөхцөл нь <strong>төсөл</strong> бөгөөд өөрчлөгдөж болно.
            Шимтгэл идэвхжих үед бид урьдчилан мэдэгдэнэ.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn-secondary">
          Нүүр хуудас
        </Link>
        <Link href="/listings" className="btn-primary">
          Surprise Bag үзэх
        </Link>
      </div>
    </div>
  );
}
