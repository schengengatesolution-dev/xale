import { NextRequest, NextResponse } from "next/server";
import { createSession, getUserByEmail, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const user = await getUserByEmail(data.email);
    if (!user) {
      return NextResponse.json(
        { error: "Имэйл эсвэл нууц үг буруу байна" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Имэйл эсвэл нууц үг буруу байна" },
        { status: 401 }
      );
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      whatsapp: user.whatsapp,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу байна" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
