import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

/** Delete company (seller) and their listings/reservations (cascade) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user || user.role !== "SELLER") {
    return NextResponse.json(
      { error: "Компани / худалдагч олдсонгүй" },
      { status: 404 }
    );
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

const patchSchema = z.object({
  bankName: z.string().min(1).max(120).optional(),
  bankAccount: z.string().min(1).max(64).optional(),
  bankAccountName: z.string().min(1).max(120).optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
});

/** Admin edit seller profile / bank */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй" }, { status: 401 });
  }
  try {
    const data = patchSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user || user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Компани / худалдагч олдсонгүй" },
        { status: 404 }
      );
    }
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(data.bankName !== undefined
          ? { bankName: data.bankName.trim() }
          : {}),
        ...(data.bankAccount !== undefined
          ? { bankAccount: data.bankAccount.trim() }
          : {}),
        ...(data.bankAccountName !== undefined
          ? { bankAccountName: data.bankAccountName.trim() }
          : {}),
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        ...(data.whatsapp !== undefined
          ? { whatsapp: data.whatsapp || null }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        bankName: true,
        bankAccount: true,
        bankAccountName: true,
      },
    });
    return NextResponse.json({ seller: updated });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
