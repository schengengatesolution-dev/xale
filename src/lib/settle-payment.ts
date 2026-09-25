import { prisma } from "@/lib/prisma";
import {
  SELLER_PAYOUT_ONELINER,
  SETTLEMENT_STATUS,
} from "@/lib/business-day";
import { generatePickupCode } from "@/lib/pickup-code";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function ensurePickupCode(
  tx: TxClient,
  reservationId: string,
  existingCode: string | null
): Promise<string> {
  if (existingCode) return existingCode;
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generatePickupCode();
    const clash = await tx.reservation.findFirst({
      where: { pickupCode: code },
      select: { id: true },
    });
    if (clash) continue;
    await tx.reservation.update({
      where: { id: reservationId },
      data: { pickupCode: code },
    });
    return code;
  }
  throw new Error("PICKUP_CODE_GEN_FAILED");
}

/**
 * Mark payment + reservation PAID and create Settlement READY (weekly Friday-cutoff queue).
 * Idempotent. Never leaves verified PAID money without a Settlement row.
 * On PAID: assign pickupCode once (do not regenerate if already set).
 * Source of truth: QPay webhook + payment/check. Client status poll is UX backup only.
 */
export async function markPaymentPaid(paymentId: string): Promise<{
  paymentId: string;
  settlementId: string;
  payoutTargetDate: Date;
  sellerPayoutNote: string;
  alreadyPaid: boolean;
  pickupCode: string | null;
}> {
  const existing = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      settlement: true,
      reservation: {
        include: { listing: { select: { sellerId: true } } },
      },
    },
  });
  if (!existing) throw new Error("PAYMENT_NOT_FOUND");

  if (existing.status === "PAID" && existing.settlement) {
    const pickupCode = await prisma.$transaction((tx) =>
      ensurePickupCode(tx, existing.reservationId, existing.reservation.pickupCode)
    );
    return {
      paymentId: existing.id,
      settlementId: existing.settlement.id,
      payoutTargetDate: existing.settlement.payoutTargetDate || new Date(),
      sellerPayoutNote: SELLER_PAYOUT_ONELINER,
      alreadyPaid: true,
      pickupCode,
    };
  }

  const sellerId = existing.reservation.listing.sellerId;
  const payoutTargetDate = new Date();
  const paidAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "PAID" },
    });

    const pickupCode = await ensurePickupCode(
      tx,
      existing.reservationId,
      existing.reservation.pickupCode
    );

    await tx.reservation.update({
      where: { id: existing.reservationId },
      data: {
        paymentStatus: "PAID",
        paidAt,
        amountMnt: existing.amountMnt,
        pickupCode,
      },
    });

    const settlement = await tx.settlement.upsert({
      where: { paymentId },
      create: {
        paymentId,
        sellerId,
        amountSellerMnt: existing.sellerAmountMnt,
        amountPlatformMnt: existing.platformFeeMnt,
        status: SETTLEMENT_STATUS.READY,
        payoutTargetDate,
        note: null,
      },
      update: {
        amountSellerMnt: existing.sellerAmountMnt,
        amountPlatformMnt: existing.platformFeeMnt,
        payoutTargetDate,
        status: SETTLEMENT_STATUS.READY,
        note: null,
      },
    });

    return { payment, settlement, pickupCode };
  });

  return {
    paymentId: result.payment.id,
    settlementId: result.settlement.id,
    payoutTargetDate: result.settlement.payoutTargetDate || payoutTargetDate,
    sellerPayoutNote: SELLER_PAYOUT_ONELINER,
    alreadyPaid: false,
    pickupCode: result.pickupCode,
  };
}

export function sellerHasBank(seller: {
  bankName: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
}): boolean {
  return Boolean(
    seller.bankName?.trim() &&
      seller.bankAccount?.trim() &&
      seller.bankAccountName?.trim()
  );
}
