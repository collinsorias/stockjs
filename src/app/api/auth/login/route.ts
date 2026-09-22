import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createSessionToken, getAuthCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !email || typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: "ERROR_404" },
      { status: 403 },
    );
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });

  const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  response.cookies.set("stockjs_session", token, getAuthCookieOptions());

  return response;
}
