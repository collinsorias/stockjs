import { NextResponse } from "next/server";

import { SUPERACCESS_COOKIE } from "@/lib/superaccess";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SUPERACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
