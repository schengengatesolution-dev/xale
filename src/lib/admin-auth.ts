import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "xale_admin";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "xale-dev-secret-change-in-production-mn-2026"
);

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || "admin@hairan.mn";
}

function getAdminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length > 0 ? p : null;
}

/** Constant-time-ish string compare for env password check. */
export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    if (a.length !== b.length) {
      // burn a compare to reduce trivial timing leak on length
      timingSafeEqual(b, b);
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminEmail(email: string): boolean {
  const expected = getAdminEmail().toLowerCase();
  return email.trim().toLowerCase() === expected;
}

export async function createAdminSession(email: string): Promise<void> {
  const token = await new SignJWT({
    admin: true,
    email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(SECRET);

  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function destroyAdminSession(): Promise<void> {
  cookies().set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type AdminSession = {
  email: string;
  admin: true;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.admin !== true) return null;
    return {
      admin: true,
      email: (payload.email as string) || getAdminEmail(),
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
