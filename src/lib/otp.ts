import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendHairanOtp } from "./sms";

export const OTP_TTL_MS = 5 * 60 * 1000; // ~5 min
export const OTP_COOLDOWN_MS = 60 * 1000; // 60s resend
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LENGTH = 6;

export function generateOtpCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(OTP_LENGTH, "0");
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 8);
}

export async function verifyOtpHash(
  code: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export type SendOtpOutcome =
  | { ok: true; cooldownSeconds: number; exists: boolean }
  | {
      ok: false;
      error: string;
      status: number;
      retryAfterSeconds?: number;
    };

/**
 * Create/overwrite OTP for phone, enforce 60s cooldown, send SMS.
 */
export async function sendPhoneOtp(phoneE164: string): Promise<SendOtpOutcome> {
  const existing = await prisma.phoneOtp.findUnique({
    where: { phone: phoneE164 },
  });
  const now = Date.now();
  if (existing) {
    const elapsed = now - existing.createdAt.getTime();
    if (elapsed < OTP_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
      return {
        ok: false,
        error: `Дахин илгээхийн өмнө ${retryAfterSeconds} сек хүлээнэ үү`,
        status: 429,
        retryAfterSeconds,
      };
    }
  }

  const code = generateOtpCode();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(now + OTP_TTL_MS);

  await prisma.phoneOtp.upsert({
    where: { phone: phoneE164 },
    create: {
      phone: phoneE164,
      codeHash,
      expiresAt,
      attempts: 0,
    },
    update: {
      codeHash,
      expiresAt,
      attempts: 0,
      createdAt: new Date(now),
    },
  });

  const sms = await sendHairanOtp(phoneE164, code);
  if (!sms.ok) {
    return {
      ok: false,
      error: sms.error || "SMS илгээхэд алдаа гарлаа",
      status: 502,
    };
  }

  const user = await prisma.user.findUnique({
    where: { phone: phoneE164 },
    select: { id: true },
  });

  return {
    ok: true,
    cooldownSeconds: 60,
    exists: Boolean(user),
  };
}

export type ConsumeOtpOutcome =
  | { ok: true }
  | { ok: false; error: string; status: number };

/**
 * Validate code against stored OTP. On success deletes the row.
 * On wrong code increments attempts; locks after max.
 */
export async function consumePhoneOtp(
  phoneE164: string,
  code: string,
  opts?: { consume?: boolean }
): Promise<ConsumeOtpOutcome> {
  const consume = opts?.consume !== false;
  const row = await prisma.phoneOtp.findUnique({
    where: { phone: phoneE164 },
  });
  if (!row) {
    return {
      ok: false,
      error: "Код олдсонгүй. Дахин илгээнэ үү",
      status: 400,
    };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.phoneOtp.delete({ where: { phone: phoneE164 } }).catch(() => {});
    return {
      ok: false,
      error: "Кодын хугацаа дууссан. Дахин илгээнэ үү",
      status: 400,
    };
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.phoneOtp.delete({ where: { phone: phoneE164 } }).catch(() => {});
    return {
      ok: false,
      error: "Хэт олон буруу оролдлого. Дахин илгээнэ үү",
      status: 429,
    };
  }

  const match = await verifyOtpHash(code.trim(), row.codeHash);
  if (!match) {
    await prisma.phoneOtp.update({
      where: { phone: phoneE164 },
      data: { attempts: { increment: 1 } },
    });
    return {
      ok: false,
      error: "Код буруу байна",
      status: 401,
    };
  }

  if (consume) {
    await prisma.phoneOtp.delete({ where: { phone: phoneE164 } }).catch(() => {});
  }
  return { ok: true };
}
