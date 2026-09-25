import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { normalizePickupCode } from "@/lib/pickup-code";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["RESERVED", "COLLECTED", "NO_SHOW", "CANCELLED"]),
  pickupCode: z.string().optional(),
});

const sellerReservationSelect = {
  id: true,
  note: true,
  status: true,
  paymentStatus: true,
  paidAt: true,
  amountMnt: true,
  listingId: true,
  buyerId: true,
  createdAt: true,
  updatedAt: true,
  buyer: {
    select: { name: true, phone: true, whatsapp: true, email: true },
  },
  listing: { select: { id: true, title: true } },
} as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const existing = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          select: {
            sellerId: true,
            pickupEnd: true,
            id: true,
            title: true,
          },
        },
      },
    });
    if (!existing || existing.listing.sellerId !== session.id) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
    }

    if (data.status === "COLLECTED") {
      if (existing.paymentStatus !== "PAID" || !existing.pickupCode) {
        return NextResponse.json(
          {
            error:
              "Төлбөр баталгаажаагүй эсвэл авах код байхгүй. Зөвхөн авах кодоор уут өгнө.",
          },
          { status: 400 }
        );
      }
      if (new Date() > existing.listing.pickupEnd) {
        return NextResponse.json(
          {
            error:
              "Авах цонх дууссан. Код хүчингүй — «Ирээгүй» тэмдэглэнэ үү.",
          },
          { status: 400 }
        );
      }
      const entered = normalizePickupCode(data.pickupCode || "");
      if (!entered || entered !== existing.pickupCode) {
        return NextResponse.json(
          { error: "Авах код буруу байна. Худалдан авагчийн кодыг шалгана уу." },
          { status: 400 }
        );
      }
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id: params.id },
        data: { status: data.status },
        select: sellerReservationSelect,
      });

      if (
        existing.status === "RESERVED" &&
        (data.status === "NO_SHOW" || data.status === "CANCELLED")
      ) {
        await tx.listing.update({
          where: { id: existing.listingId },
          data: {
            quantityAvailable: { increment: 1 },
            status: "ACTIVE",
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ reservation });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу байна" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
