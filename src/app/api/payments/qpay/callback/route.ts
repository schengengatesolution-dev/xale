import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPayment, isCheckoutEnabled } from "@/lib/qpay";
import { markPaymentPaid } from "@/lib/settle-payment";

/**
 * QPay POSTs { invoice_id }. ALWAYS verify via payment/check before marking paid.
 * On PAID: Payment PAID + Reservation PAID + Settlement READY (instant payout intent).
 */
export async function POST(req: NextRequest) {
  try {
    if (!isCheckoutEnabled()) {
      // Still ack so QPay doesn't retry forever in misconfigured staging
      return NextResponse.json({ ok: true, skipped: true });
    }

    const body = await req.json().catch(() => ({}));
    const invoiceId =
      (body && (body.invoice_id || body.invoiceId || body.object_id)) ||
      null;

    if (!invoiceId || typeof invoiceId !== "string") {
      return NextResponse.json({ ok: true });
    }

    const payment = await prisma.payment.findFirst({
      where: { qpayInvoiceId: invoiceId },
    });
    if (!payment) {
      console.error("QPay callback: unknown invoice", invoiceId.slice(0, 24));
      return NextResponse.json({ ok: true });
    }

    if (payment.status === "PAID") {
      // Ensure settlement exists (idempotent)
      await markPaymentPaid(payment.id);
      return NextResponse.json({ ok: true });
    }

    const { paid } = await checkPayment(invoiceId);
    if (!paid) {
      return NextResponse.json({ ok: true, pending: true });
    }

    await markPaymentPaid(payment.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("QPay callback error", e instanceof Error ? e.message : e);
    // Return 200 to avoid aggressive retries storm; status poll can recover
    return NextResponse.json({ ok: true });
  }
}

/** Some gateways probe with GET */
export async function GET() {
  return NextResponse.json({ ok: true });
}
