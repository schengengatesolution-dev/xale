import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["RESERVED", "COLLECTED", "NO_SHOW", "CANCELLED"]),
});

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
      include: { listing: true },
    });
    if (!existing || existing.listing.sellerId !== session.id) {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id: params.id },
        data: { status: data.status },
        include: {
          buyer: {
            select: { name: true, phone: true, whatsapp: true, email: true },
          },
          listing: { select: { id: true, title: true } },
        },
      });

      // Restore quantity if cancelling or marking no-show from RESERVED
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
