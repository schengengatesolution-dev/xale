import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const bankSchema = z.object({
  bankName: z.string().min(1).max(120),
  bankAccount: z.string().min(1).max(64),
  bankAccountName: z.string().min(1).max(120),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      bankName: true,
      bankAccount: true,
      bankAccountName: true,
    },
  });
  return NextResponse.json({ bank: user });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }
  try {
    const data = bankSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        bankName: data.bankName.trim(),
        bankAccount: data.bankAccount.trim(),
        bankAccountName: data.bankAccountName.trim(),
      },
      select: {
        bankName: true,
        bankAccount: true,
        bankAccountName: true,
      },
    });
    return NextResponse.json({ bank: user });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Банкны мэдээллийг бүрэн оруулна уу" },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
