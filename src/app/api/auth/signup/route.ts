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

  const { name, email, password, location, investmentGoal } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
  });

  if (existingUser) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  // New sign-ups are active by default so the signup -> login -> dashboard
  // flow works out of the box. Administrators can still disable an account
  // afterwards from the superaccess dashboard.
  const user = await prisma.user.create({
    data: {
      name: String(name),
      email: String(email).toLowerCase(),
      passwordHash: await bcrypt.hash(String(password), 10),
      location: location ? String(location) : null,
      investmentGoal: investmentGoal ? String(investmentGoal) : null,
      role: "USER",
      isActive: true,
    },
  });

  // Sign the new user in immediately so signup -> dashboard is one step.
  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  });

  const response = NextResponse.json({
    ok: true,
    pendingApproval: false,
    message: "Your account is ready.",
    user: { id: user.id, email: user.email, isActive: user.isActive },
  });
  response.cookies.set("stockjs_session", token, getAuthCookieOptions());

  return response;
}
