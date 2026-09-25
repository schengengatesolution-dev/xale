import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMnPhone } from "@/lib/phone";
import { sendPhoneOtp } from "@/lib/otp";

const schema = z.object({
  phone: z.string().min(1),
  purpose: z.enum(["login", "register"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const phone = normalizeMnPhone(data.phone);
    if (!phone) {
      return NextResponse.json(
        { error: "Утасны дугаар буруу байна (+976 + 8 орон)" },
        { status: 400 }
      );
    }

    const result = await sendPhoneOtp(phone);
    if (!result.ok) {
      const headers: HeadersInit = {};
      if (result.retryAfterSeconds != null) {
        headers["Retry-After"] = String(result.retryAfterSeconds);
      }
      return NextResponse.json(
        {
          error: result.error,
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status: result.status, headers }
      );
    }

    return NextResponse.json({
      ok: true,
      phone,
      purpose: data.purpose,
      exists: result.exists,
      cooldownSeconds: result.cooldownSeconds,
      hint: "Hairan Kod: ……",
      message: "Код илгээлээ. SMS-ээ шалгана уу.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Мэдээлэл буруу байна" },
        { status: 400 }
      );
    }
    console.error("[otp/send]", e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
