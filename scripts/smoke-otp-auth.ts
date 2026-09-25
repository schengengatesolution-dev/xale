/**
 * End-to-end OTP auth smoke (buyer register → login, seller register).
 * Uses lib directly (not HTTP) with SMS_PROVIDER=console.
 */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../src/lib/prisma";
import { normalizeMnPhone, syntheticEmailFromPhone } from "../src/lib/phone";
import { sendPhoneOtp, consumePhoneOtp, OTP_COOLDOWN_MS } from "../src/lib/otp";
import { hashPassword, createToken } from "../src/lib/auth";

async function forceCode(phone: string, code: string) {
  await prisma.phoneOtp.update({
    where: { phone },
    data: {
      codeHash: await bcrypt.hash(code, 8),
      attempts: 0,
      createdAt: new Date(Date.now() - OTP_COOLDOWN_MS - 1000),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
}

async function register(phoneRaw: string, role: "BUYER" | "SELLER", name: string) {
  const phone = normalizeMnPhone(phoneRaw)!;
  await prisma.phoneOtp.deleteMany({ where: { phone } });
  await prisma.user.deleteMany({ where: { phone } });
  await prisma.user.deleteMany({ where: { email: syntheticEmailFromPhone(phone) } });

  const s = await sendPhoneOtp(phone);
  if (!s.ok) throw new Error("send failed " + s.error);
  const code = "111222";
  await forceCode(phone, code);

  // first verify → needsRole path simulated
  const keep = await consumePhoneOtp(phone, code, { consume: false });
  if (!keep.ok) throw new Error(keep.error);

  const consume = await consumePhoneOtp(phone, code, { consume: true });
  if (!consume.ok) throw new Error(consume.error);

  const user = await prisma.user.create({
    data: {
      email: syntheticEmailFromPhone(phone),
      passwordHash: await hashPassword(crypto.randomBytes(16).toString("hex")),
      name,
      phone,
      whatsapp: phone,
      role,
      bankName: role === "SELLER" ? "Хаан банк" : null,
      bankAccount: role === "SELLER" ? "5000000000" : null,
      bankAccountName: role === "SELLER" ? name : null,
    },
  });
  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    whatsapp: user.whatsapp,
  });
  return { user, token, phone };
}

async function loginExisting(phoneRaw: string) {
  const phone = normalizeMnPhone(phoneRaw)!;
  await prisma.phoneOtp.deleteMany({ where: { phone } });
  const s = await sendPhoneOtp(phone);
  if (!s.ok) throw new Error("login send " + s.error);
  if (!s.exists) throw new Error("expected exists");
  const code = "333444";
  await forceCode(phone, code);
  const ok = await consumePhoneOtp(phone, code, { consume: true });
  if (!ok.ok) throw new Error(ok.error);
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error("missing user");
  return user;
}

async function main() {
  process.env.SMS_PROVIDER = "console";
  const buyer = await register("80223344", "BUYER", "Тест Худалдан авагч");
  console.log("buyer register", buyer.user.email, buyer.user.role);

  const buyerLogin = await loginExisting("80223344");
  console.log("buyer login", buyerLogin.id === buyer.user.id);

  const seller = await register("80334455", "SELLER", "Тест Дэлгүүр");
  console.log("seller register", seller.user.email, seller.user.bankName);

  // cleanup test users
  await prisma.user.deleteMany({
    where: { phone: { in: [buyer.phone, seller.user.phone!] } },
  });
  await prisma.phoneOtp.deleteMany({
    where: { phone: { in: [buyer.phone, seller.user.phone!] } },
  });
  console.log("AUTH SMOKE OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
