import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["FOOD", "RESTAURANT_SURPLUS", "OTHER"]),
  description: z.string().min(1),
  originalPrice: z.number().int().positive(),
  discountPrice: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  expiryDate: z.string(),
  pickupDistrict: z.string().min(1),
  photoUrl: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SOLD", "EXPIRED", "HIDDEN"]).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const district = searchParams.get("district");
  const status = searchParams.get("status") || "ACTIVE";
  const mine = searchParams.get("mine") === "1";
  const q = searchParams.get("q");

  const session = await getSession();

  const where: Record<string, unknown> = {};

  if (mine) {
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
    }
    where.sellerId = session.id;
    if (searchParams.get("status")) {
      where.status = status;
    }
  } else {
    where.status = status;
  }

  if (category) where.category = category;
  if (district) where.pickupDistrict = district;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      seller: {
        select: { id: true, name: true, phone: true, whatsapp: true },
      },
      _count: { select: { interests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        ...data,
        photoUrl: data.photoUrl || null,
        expiryDate: new Date(data.expiryDate),
        status: data.status || "ACTIVE",
        sellerId: session.id,
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
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
