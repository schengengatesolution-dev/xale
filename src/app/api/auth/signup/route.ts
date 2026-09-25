import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6).optional(),
    name: z.string().min(1),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    role: z.enum(["SELLER", "BUYER"]),
    bankName: z.string().optional(),
    bankAccount: z.string().optional(),
    bankAccountName: z.string().optional(),
  })
  .refine(
    (d) => d.passwordConfirm == null || d.passwordConfirm === d.password,
    { message: "Нууц үг таарахгүй байна", path: ["passwordConfirm"] }
  )
  .superRefine((d, ctx) => {
    if (d.role === "SELLER") {
      for (const key of ["bankName", "bankAccount", "bankAccountName"] as const) {
        if (!d[key]?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Худалдагч банкны мэдээлэл заавал",
            path: [key],
          });
        }
      }
    }
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (data.passwordConfirm != null && data.passwordConfirm !== data.password) {
      return NextResponse.json(
        { error: "Нууц үг таарахгүй байна. Дахин оруулна уу." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Энэ имэйл аль хэдийн бүртгэлтэй байна" },
        { status: 400 }
      );
    }

    if (data.role === "SELLER") {
      if (
        !data.bankName?.trim() ||
        !data.bankAccount?.trim() ||
        !data.bankAccountName?.trim()
      ) {
        return NextResponse.json(
          { error: "Худалдагч банкны мэдээлэл (банк, данс, нэр) заавал" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone || null,
        whatsapp: data.whatsapp || data.phone || null,
        role: data.role,
        bankName: data.role === "SELLER" ? data.bankName!.trim() : null,
        bankAccount: data.role === "SELLER" ? data.bankAccount!.trim() : null,
        bankAccountName:
          data.role === "SELLER" ? data.bankAccountName!.trim() : null,
      },
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      whatsapp: user.whatsapp,
    };

    const token = await createSession(sessionUser);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
      },
      token,
    });
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
