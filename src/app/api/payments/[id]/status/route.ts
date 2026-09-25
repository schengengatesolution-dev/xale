import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkPayment, isCheckoutEnabled } from "@/lib/qpay";
import { markPaymentPaid } from "@/lib/settle-payment";
import { SELLER_PAYOUT_ONELINER } from "@/lib/business-day";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      reservation: { select: { buyerId: true, paymentStatus: true, paidAt: true } },
      settlement: {
        select: {
          id: true,
          status: true,
          payoutTargetDate: true,
        },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "Төлбөр олдсонгүй" }, { status: 404 });
  }

  const isBuyer = session.role === "BUYER" && payment.reservation.buyerId === session.id;
  // Admin not via getSession — buyers only for this poll endpoint
  if (!isBuyer) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  let status = payment.status;
  let settlement = payment.settlement;

  if (
    isCheckoutEnabled() &&
    status !== "PAID" &&
    payment.qpayInvoiceId
  ) {
    try {
      const { paid } = await checkPayment(payment.qpayInvoiceId);
      if (paid) {
        const result = await markPaymentPaid(payment.id);
        status = "PAID";
        settlement = {
          id: result.settlementId,
          status: "READY",
          payoutTargetDate: result.payoutTargetDate,
        };
      }
    } catch (e) {
      console.error("status recheck failed", e instanceof Error ? e.message : e);
    }
  }

  // Buyer-facing: no fee amounts / %
  return NextResponse.json({
    paymentId: payment.id,
    status,
    amountMnt: payment.amountMnt,
    paymentStatus: status === "PAID" ? "PAID" : payment.reservation.paymentStatus,
    paidAt: payment.reservation.paidAt,
    urls: payment.urls,
    settlement:
      status === "PAID" && settlement
        ? {
            status: settlement.status,
            payoutTargetDate: settlement.payoutTargetDate,
            note: SELLER_PAYOUT_ONELINER,
          }
        : null,
  });
}
