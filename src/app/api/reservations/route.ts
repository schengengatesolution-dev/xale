import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  listingId: z.string().min(1),
  note: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") {
    return NextResponse.json(
      { error: "Зөвхөн худалдан авагч захиалах боломжтой" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: data.listingId },
      });
      if (!listing || listing.status !== "ACTIVE") {
        return { error: "Зар олдсонгүй эсвэл идэвхгүй", status: 404 as const };
      }
      if (listing.quantityAvailable < 1) {
        return { error: "Үлдсэн уут байхгүй", status: 400 as const };
      }
      if (new Date() > listing.pickupEnd) {
        return { error: "Авах цонх дууссан", status: 400 as const };
      }

      const existing = await tx.reservation.findFirst({
        where: {
          listingId: data.listingId,
          buyerId: session.id,
          status: "RESERVED",
        },
      });
      if (existing) {
        return {
          error: "Та энэ Азтай уутыг аль хэдийн захиалсан",
          status: 400 as const,
        };
      }

      const reservation = await tx.reservation.create({
        data: {
          listingId: data.listingId,
          buyerId: session.id,
          note: data.note || null,
          status: "RESERVED",
        },
        include: {
          buyer: { select: { name: true, phone: true, whatsapp: true } },
          listing: { select: { id: true, title: true, bagPrice: true } },
        },
      });

      const newQty = listing.quantityAvailable - 1;
      await tx.listing.update({
        where: { id: listing.id },
        data: {
          quantityAvailable: newQty,
          ...(newQty === 0 ? { status: "SOLD_OUT" } : {}),
        },
      });

      return { reservation };
    });

    if ("error" in result && result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(
      { reservation: result.reservation },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу байна" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { listing: { sellerId: session.id } },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          bagPrice: true,
          pickupStart: true,
          pickupEnd: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reservations });
}
