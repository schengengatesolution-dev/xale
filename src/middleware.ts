import { NextRequest, NextResponse } from "next/server";

/** Allow Expo / mobile clients to call /api/* with Bearer tokens. */
function corsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin === "null" ? "*" : origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const headers = corsHeaders(req);

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  const res = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value as string);
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
