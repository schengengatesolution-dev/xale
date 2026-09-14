import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.enum(["FOOD", "RESTAURANT_SURPLUS", "OTHER"]).optional(),
  description: z.string().min(1).optional(),
  originalPrice: z.number().int().positive().optional(),
  discountPrice: z.number().int().nonnegative().optional(),
  quantity: z.number().int().positive().optional(),
  unit: z.string().min(1).optional(),
  expiryDate: z.string().optional(),
  pickupDistrict: z.string().min(1).optional(),
  photoUrl: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SOLD", "EXPIRED", "HIDDEN"]).optional(),
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
      _count: { select: { interests: true } },
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

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.expiryDate ? { expiryDate: new Date(data.expiryDate) } : {}),
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
