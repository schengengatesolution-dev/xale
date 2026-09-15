import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  role: z.enum(["SELLER", "BUYER"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Энэ имэйл аль хэдийн бүртгэлтэй байна" },
        { status: 400 }
      );
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
