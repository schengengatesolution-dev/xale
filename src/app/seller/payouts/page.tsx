import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMNT } from "@/lib/constants";
import { SellerNav } from "@/components/SellerNav";
import {
  SELLER_PAYOUT_DETAIL,
  SELLER_PAYOUT_ONELINER,
  SETTLEMENT_STATUS,
} from "@/lib/business-day";

export const dynamic = "force-dynamic";

export default async function SellerPayoutsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SELLER") redirect("/listings");

  const settlements = await prisma.settlement.findMany({
    where: { sellerId: session.id },
    include: {
      payment: {
        select: {
          amountMnt: true,
          reservation: {
            select: { listing: { select: { title: true } } },
          },
        },
      },
      payoutBatch: { select: { label: true, paidAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = settlements.filter(
    (s) =>
      s.status === SETTLEMENT_STATUS.READY ||
      s.status === SETTLEMENT_STATUS.PROCESSING
  );
  const paid = settlements.filter(
    (s) => s.status === SETTLEMENT_STATUS.PAID_OUT
  );
  const pendingTotal = pending.reduce((a, s) => a + s.amountSellerMnt, 0);
  const paidTotal = paid.reduce((a, s) => a + s.amountSellerMnt, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Төлбөр шилжүүлэг</h1>
      <p className="mt-1 text-sm text-stone-600">{SELLER_PAYOUT_ONELINER}</p>
      <p className="mt-2 text-xs text-stone-500">{SELLER_PAYOUT_DETAIL}</p>

      <div className="mt-6">
        <SellerNav active="/seller/payouts" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="card !p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Хүлээгдэж буй
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {formatMNT(pendingTotal)}
          </p>
          <p className="text-xs text-stone-500">{pending.length} захиалга</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Төлөгдсөн
          </p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {formatMNT(paidTotal)}
          </p>
          <p className="text-xs text-stone-500">{paid.length} захиалга</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-500">
        Банкны мэдээллээ{" "}
        <Link href="/seller/settings" className="font-semibold text-green-700">
          Тохиргоо
        </Link>{" "}
        хэсэгт шалгаарай.
      </p>

      {settlements.length === 0 ? (
        <div className="card mt-6 text-center text-stone-500">
          Одоогоор шилжүүлэг байхгүй.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {settlements.map((s) => {
            const pendingRow =
              s.status === SETTLEMENT_STATUS.READY ||
              s.status === SETTLEMENT_STATUS.PROCESSING;
            return (
              <li key={s.id} className="card space-y-1 !p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {s.payment.reservation?.listing?.title || "Азтай уут"}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatDate(s.createdAt)}
                      {s.payoutBatch?.label
                        ? ` · багц ${s.payoutBatch.label}`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      pendingRow
                        ? "bg-amber-100 text-amber-900"
                        : s.status === SETTLEMENT_STATUS.PAID_OUT
                          ? "bg-green-100 text-green-900"
                          : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {pendingRow
                      ? "Хүлээгдэж буй"
                      : s.status === SETTLEMENT_STATUS.PAID_OUT
                        ? "Төлөгдсөн"
                        : "Түр зогсоосон"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-green-800">
                  {formatMNT(s.amountSellerMnt)}
                </p>
                {pendingRow && (
                  <p className="text-[11px] text-stone-500">
                    {SELLER_PAYOUT_ONELINER}
                  </p>
                )}
                {s.paidOutAt && (
                  <p className="text-[11px] text-stone-500">
                    Төлсөн: {formatDate(s.paidOutAt)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
