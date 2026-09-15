import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  category: z
    .enum(["BAKERY", "RESTAURANT", "HOTEL", "GROCERY", "CAFE", "OTHER"])
    .optional(),
  description: z.string().min(1).optional(),
  bagPrice: z.number().int().nonnegative().optional(),
  estimatedRetailValue: z.number().int().positive().optional(),
  quantityAvailable: z.number().int().nonnegative().optional(),
  pickupStart: z.string().optional(),
  pickupEnd: z.string().optional(),
  pickupDistrict: z.string().min(1).optional(),
  pickupAddress: z.string().optional().nullable(),
  dietaryNotes: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SOLD_OUT", "EXPIRED", "HIDDEN"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: { id: true, name: true, phone: true, whatsapp: true },
      },
      _count: {
        select: {
          reservations: { where: { status: "RESERVED" } },
        },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Зар олдсонгүй" }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  const existing = await prisma.listing.findUnique({
    where: { id: params.id },
  });
  if (!existing || existing.sellerId !== session.id) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const pickupStart = data.pickupStart
      ? new Date(data.pickupStart)
      : existing.pickupStart;
    const pickupEnd = data.pickupEnd
      ? new Date(data.pickupEnd)
      : existing.pickupEnd;
    if (!(pickupEnd > pickupStart)) {
      return NextResponse.json(
        { error: "Авах цонхны төгсгөл эхлэлээс хойш байх ёстой" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.bagPrice !== undefined ? { bagPrice: data.bagPrice } : {}),
        ...(data.estimatedRetailValue !== undefined
          ? { estimatedRetailValue: data.estimatedRetailValue }
          : {}),
        ...(data.quantityAvailable !== undefined
          ? { quantityAvailable: data.quantityAvailable }
          : {}),
        pickupStart,
        pickupEnd,
        ...(data.pickupDistrict !== undefined
          ? { pickupDistrict: data.pickupDistrict }
          : {}),
        ...(data.pickupAddress !== undefined
          ? { pickupAddress: data.pickupAddress }
          : {}),
        ...(data.dietaryNotes !== undefined
          ? { dietaryNotes: data.dietaryNotes }
          : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });

    return NextResponse.json({ listing });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Мэдээлэл буруу байна", details: e.errors },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  const existing = await prisma.listing.findUnique({
    where: { id: params.id },
  });
  if (!existing || existing.sellerId !== session.id) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
