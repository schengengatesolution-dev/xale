import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  createInvoice,
  isCheckoutEnabled,
  splitAmount,
} from "@/lib/qpay";
import { sellerHasBank } from "@/lib/settle-payment";

const bodySchema = z.object({
  reservationId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") {
    return NextResponse.json(
      { error: "Зөвхөн худалдан авагч төлбөр хийх боломжтой" },
      { status: 403 }
    );
  }

  if (!isCheckoutEnabled()) {
    return NextResponse.json(
      {
        error:
          "Апп доторх төлбөр одоогоор идэвхгүй байна. Төлбөрийг авах үедээ хийнэ үү.",
      },
      { status: 503 }
    );
  }

  try {
    const data = bodySchema.parse(await req.json());

    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                bankName: true,
                bankAccount: true,
                bankAccountName: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!reservation || reservation.buyerId !== session.id) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 }
      );
    }
    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Цуцлагдсан захиалга төлөх боломжгүй" },
        { status: 400 }
      );
    }
    if (reservation.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Энэ захиалга аль хэдийн төлөгдсөн" },
        { status: 400 }
      );
    }
    if (!sellerHasBank(reservation.listing.seller)) {
      return NextResponse.json(
        {
          error:
            "Худалдагчийн банкны мэдээлэл бүрэн бус байна. Түр хүлээнэ үү.",
        },
        { status: 400 }
      );
    }

    const amountMnt = reservation.listing.bagPrice;
    if (amountMnt < 1) {
      return NextResponse.json(
        { error: "Төлбөрийн дүн буруу байна" },
        { status: 400 }
      );
    }

    const { platformFeeMnt, sellerAmountMnt } = splitAmount(amountMnt);
    const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
    if (!appUrl) {
      return NextResponse.json(
        { error: "Төлбөрийн тохиргоо дутуу байна" },
        { status: 500 }
      );
    }

    // Reuse existing CREATED/PENDING payment if present
    let payment = reservation.payment;
    if (payment && payment.status === "PAID") {
      return NextResponse.json(
        { error: "Энэ захиалга аль хэдийн төлөгдсөн" },
        { status: 400 }
      );
    }

    const senderInvoiceNo =
      payment?.senderInvoiceNo ||
      `HRN-${reservation.id.slice(-8)}-${Date.now().toString(36)}`;

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          senderInvoiceNo,
          amountMnt,
          platformFeeMnt,
          sellerAmountMnt,
          status: "CREATED",
        },
      });
    }

    const callbackUrl = `${appUrl}/api/payments/qpay/callback`;
    const invoice = await createInvoice({
      senderInvoiceNo: payment.senderInvoiceNo,
      amount: amountMnt,
      description: `Хайран · ${reservation.listing.title}`.slice(0, 240),
      callbackUrl,
    });

    const urls = {
      qr_text: invoice.qr_text || null,
      qr_image: invoice.qr_image || null,
      urls: invoice.urls || [],
    };

    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        qpayInvoiceId: invoice.invoice_id,
        qpayPayload: invoice as object,
        urls: urls as object,
        status: "CREATED",
        amountMnt,
        platformFeeMnt,
        sellerAmountMnt,
      },
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        paymentStatus: "PENDING",
        amountMnt,
      },
    });

    // Buyer response: never include fee % or platformFee fields
    return NextResponse.json({
      paymentId: payment.id,
      amountMnt,
      qr_text: invoice.qr_text || null,
      qr_image: invoice.qr_image || null,
      urls: invoice.urls || [],
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу байна" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "";
    if (msg === "QPAY_CONFIG_MISSING" || msg === "QPAY_AUTH_FAILED" || msg === "QPAY_INVOICE_FAILED") {
      console.error("QPay create error", msg);
      return NextResponse.json(
        { error: "QPay холболт амжилтгүй. Дараа дахин оролдоно уу." },
        { status: 502 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
