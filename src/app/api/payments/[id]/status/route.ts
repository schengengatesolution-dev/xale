import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkPayment, isCheckoutEnabled } from "@/lib/qpay";
import { markPaymentPaid } from "@/lib/settle-payment";

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
      reservation: {
        select: {
          buyerId: true,
          paymentStatus: true,
          paidAt: true,
          pickupCode: true,
        },
      },
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

  const isBuyer =
    session.role === "BUYER" && payment.reservation.buyerId === session.id;
  if (!isBuyer) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  let status = payment.status;
  let settlement = payment.settlement;
  let pickupCode = payment.reservation.pickupCode;

  if (isCheckoutEnabled() && status !== "PAID" && payment.qpayInvoiceId) {
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
        pickupCode = result.pickupCode;
      }
    } catch (e) {
      console.error("status recheck failed", e instanceof Error ? e.message : e);
    }
  }

  // Buyer-facing: no fee amounts / %; pickupCode only after PAID
  return NextResponse.json({
    paymentId: payment.id,
    status,
    amountMnt: payment.amountMnt,
    paymentStatus:
      status === "PAID" ? "PAID" : payment.reservation.paymentStatus,
    paidAt: payment.reservation.paidAt,
    pickupCode: status === "PAID" ? pickupCode : null,
    urls: payment.urls,
    settlement:
      status === "PAID" && settlement
        ? {
            status: settlement.status,
            payoutTargetDate: settlement.payoutTargetDate,
          }
        : null,
  });
}
