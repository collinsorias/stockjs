import { NextResponse } from "next/server";
import { SignJWT } from "jose";

import { jwtSecret } from "@/lib/jwt-secret";
import { SUPERACCESS_COOKIE } from "@/lib/superaccess";
import { verifySuperaccessCredentials } from "@/lib/superaccess-credentials";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body ?? {};

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  if (!verifySuperaccessCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const token = await new SignJWT({
    isAdmin: true,
    username: String(username),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SUPERACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
