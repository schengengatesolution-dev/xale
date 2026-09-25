import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { normalizeMnPhone, syntheticEmailFromPhone } from "@/lib/phone";
import { consumePhoneOtp } from "@/lib/otp";
import crypto from "crypto";

const schema = z
  .object({
    phone: z.string().min(1),
    code: z.string().min(4).max(8),
    purpose: z.enum(["login", "register"]),
    role: z.enum(["BUYER", "SELLER"]).optional(),
    name: z.string().min(1).optional(),
    bankName: z.string().optional(),
    bankAccount: z.string().optional(),
    bankAccountName: z.string().optional(),
  })
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

function sessionPayload(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  whatsapp: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    whatsapp: user.whatsapp,
  };
}

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

    const code = data.code.replace(/\D/g, "");
    if (code.length !== 6) {
      return NextResponse.json(
        { error: "6 оронтой код оруулна уу" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    // Existing user → login (skip role). Consume OTP on success.
    if (existing) {
      const otp = await consumePhoneOtp(phone, code, { consume: true });
      if (!otp.ok) {
        return NextResponse.json({ error: otp.error }, { status: otp.status });
      }
      const sessionUser = sessionPayload(existing);
      const token = await createSession(sessionUser);
      return NextResponse.json({
        ok: true,
        user: sessionUser,
        token,
        isNew: false,
      });
    }

    // New user — need role after OTP verify
    if (!data.role) {
      // Validate code but keep OTP so client can resubmit with role
      const otp = await consumePhoneOtp(phone, code, { consume: false });
      if (!otp.ok) {
        return NextResponse.json({ error: otp.error }, { status: otp.status });
      }
      return NextResponse.json({
        ok: true,
        needsRole: true,
        phone,
        message: "Код зөв. Төрлөө сонгоно уу.",
      });
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

    const otp = await consumePhoneOtp(phone, code, { consume: true });
    if (!otp.ok) {
      return NextResponse.json({ error: otp.error }, { status: otp.status });
    }

    const email = syntheticEmailFromPhone(phone);
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return NextResponse.json(
        { error: "Энэ утас аль хэдийн бүртгэлтэй байна" },
        { status: 400 }
      );
    }

    const name =
      data.name?.trim() ||
      (data.role === "SELLER" ? "Худалдагч" : "Хэрэглэгч");
    // Unusable random password — phone OTP is primary auth
    const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        whatsapp: phone,
        role: data.role,
        bankName: data.role === "SELLER" ? data.bankName!.trim() : null,
        bankAccount: data.role === "SELLER" ? data.bankAccount!.trim() : null,
        bankAccountName:
          data.role === "SELLER" ? data.bankAccountName!.trim() : null,
      },
    });

    const sessionUser = sessionPayload(user);
    const token = await createSession(sessionUser);
    return NextResponse.json({
      ok: true,
      user: sessionUser,
      token,
      isNew: true,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Мэдээлэл буруу байна", details: e.errors },
        { status: 400 }
      );
    }
    console.error("[otp/verify]", e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
