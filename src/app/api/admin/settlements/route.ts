import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const settlements = await prisma.settlement.findMany({
    where: status ? { status } : undefined,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bankName: true,
          bankAccount: true,
          bankAccountName: true,
        },
      },
      payment: {
        select: {
          id: true,
          amountMnt: true,
          platformFeeMnt: true,
          sellerAmountMnt: true,
          status: true,
          createdAt: true,
          reservation: {
            select: {
              id: true,
              listing: { select: { title: true } },
            },
          },
        },
      },
    },
    orderBy: [{ status: "asc" }, { payoutTargetDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ settlements });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["READY", "PROCESSING", "PAID_OUT", "HELD"]),
  note: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 });
  }
  try {
    const data = patchSchema.parse(await req.json());
    const settlement = await prisma.settlement.update({
      where: { id: data.id },
      data: {
        status: data.status,
        ...(data.note !== undefined ? { note: data.note } : {}),
      },
    });
    return NextResponse.json({ settlement });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
