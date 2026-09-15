import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminEmail,
  verifyAdminEmail,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Админ нэвтрэлт тохируулаагүй байна (ADMIN_PASSWORD)" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const data = schema.parse(body);

    if (!verifyAdminEmail(data.email) || !verifyAdminPassword(data.password)) {
      return NextResponse.json(
        { error: "Имэйл эсвэл нууц үг буруу байна" },
        { status: 401 }
      );
    }

    await createAdminSession(getAdminEmail());

    return NextResponse.json({ ok: true, email: getAdminEmail() });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Мэдээлэл буруу байна" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
