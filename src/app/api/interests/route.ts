import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  listingId: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") {
    return NextResponse.json(
      { error: "Зөвхөн худалдан авагч сонирхол илгээх боломжтой" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
    });
    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Зар олдсонгүй эсвэл идэвхгүй" },
        { status: 404 }
      );
    }

    const interest = await prisma.interest.create({
      data: {
        listingId: data.listingId,
        buyerId: session.id,
        message: data.message,
      },
      include: {
        buyer: { select: { name: true, phone: true, whatsapp: true } },
      },
    });

    return NextResponse.json({ interest }, { status: 201 });
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

  const interests = await prisma.interest.findMany({
    where: { listing: { sellerId: session.id } },
    include: {
      buyer: { select: { id: true, name: true, phone: true, whatsapp: true, email: true } },
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ interests });
}
