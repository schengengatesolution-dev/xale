import { normalizeMnPhone, syntheticEmailFromPhone } from "../src/lib/phone";
import { hairanOtpBody } from "../src/lib/sms";
import { sendPhoneOtp, consumePhoneOtp, OTP_COOLDOWN_MS } from "../src/lib/otp";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const phone = normalizeMnPhone("80112233");
  if (!phone) throw new Error("normalize failed");
  console.log("normalize ok", phone, syntheticEmailFromPhone(phone));
  console.log("body", hairanOtpBody("123456"));

  await prisma.phoneOtp.deleteMany({ where: { phone } });
  await prisma.user.deleteMany({ where: { phone } });

  process.env.SMS_PROVIDER = "console";
  const send1 = await sendPhoneOtp(phone);
  console.log("send1", send1);
  if (!send1.ok) throw new Error("send1 failed");

  const send2 = await sendPhoneOtp(phone);
  console.log("send2 (expect cooldown)", send2);
  if (send2.ok || send2.status !== 429) throw new Error("cooldown should block");

  const row = await prisma.phoneOtp.findUnique({ where: { phone } });
  if (!row) throw new Error("no otp row");

  const bad = await consumePhoneOtp(phone, "000000", { consume: false });
  console.log("wrong code", bad);
  if (bad.ok) throw new Error("wrong should fail");

  const code = "654321";
  await prisma.phoneOtp.update({
    where: { phone },
    data: {
      codeHash: await bcrypt.hash(code, 8),
      attempts: 0,
      createdAt: new Date(Date.now() - OTP_COOLDOWN_MS - 1000),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  const needs = await consumePhoneOtp(phone, code, { consume: false });
  console.log("verify keep", needs);
  if (!needs.ok) throw new Error("keep verify failed");

  const done = await consumePhoneOtp(phone, code, { consume: true });
  console.log("verify consume", done);
  if (!done.ok) throw new Error("consume failed");

  const gone = await prisma.phoneOtp.findUnique({ where: { phone } });
  console.log("row after consume", gone);

  const send3 = await sendPhoneOtp(phone);
  console.log("send3 after consume", send3);

  await prisma.phoneOtp.deleteMany({ where: { phone } });
  console.log("SMOKE OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
