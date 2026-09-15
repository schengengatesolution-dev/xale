import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "xale_session";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "xale-dev-secret-change-in-production-mn-2026"
);

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  whatsapp: string | null;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Sign a JWT for cookie and/or mobile Bearer use. */
export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    whatsapp: user.whatsapp,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      phone: (payload.phone as string) || null,
      whatsapp: (payload.whatsapp as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Create httpOnly cookie session and return the JWT string
 * so mobile clients can store Bearer token.
 */
export async function createSession(user: SessionUser): Promise<string> {
  const token = await createToken(user);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Resolve session from Authorization: Bearer <token> OR cookie.
 * Works in Route Handlers and Server Components via next/headers.
 */
export async function getSession(): Promise<SessionUser | null> {
  const hdrs = headers();
  const auth = hdrs.get("authorization");
  let token: string | undefined;

  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    token = auth.slice(7).trim();
  } else {
    token = cookies().get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(
  role?: "SELLER" | "BUYER"
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (role && session.role !== role) throw new Error("FORBIDDEN");
  return session;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
