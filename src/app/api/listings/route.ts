import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  category: z.enum([
    "BAKERY",
    "RESTAURANT",
    "HOTEL",
    "GROCERY",
    "CAFE",
    "OTHER",
  ]),
  description: z.string().min(1),
  bagPrice: z.number().int().nonnegative(),
  estimatedRetailValue: z.number().int().positive(),
  quantityAvailable: z.number().int().positive(),
  pickupStart: z.string(),
  pickupEnd: z.string(),
  pickupDistrict: z.string().min(1),
  pickupAddress: z.string().optional().nullable(),
  dietaryNotes: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SOLD_OUT", "EXPIRED", "HIDDEN"]).optional(),
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
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
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
    orderBy: { pickupStart: "asc" },
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
    const pickupStart = new Date(data.pickupStart);
    const pickupEnd = new Date(data.pickupEnd);
    if (!(pickupEnd > pickupStart)) {
      return NextResponse.json(
        { error: "Авах цонхны төгсгөл эхлэлээс хойш байх ёстой" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        bagPrice: data.bagPrice,
        estimatedRetailValue: data.estimatedRetailValue,
        quantityAvailable: data.quantityAvailable,
        pickupStart,
        pickupEnd,
        pickupDistrict: data.pickupDistrict,
        pickupAddress: data.pickupAddress || null,
        dietaryNotes: data.dietaryNotes || null,
        photoUrl: data.photoUrl || null,
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
