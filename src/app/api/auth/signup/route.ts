import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const PENDING_APPROVAL_MESSAGE =
  "Your account has been created and is awaiting administrator approval. You will be able to sign in once it has been activated.";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, location, investmentGoal } = body ?? {};

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

  // New sign-ups start disabled. An administrator must activate the account
  // from the superaccess dashboard before the user can log in.
  const user = await prisma.user.create({
    data: {
      name: String(name),
      email: String(email).toLowerCase(),
      passwordHash: await bcrypt.hash(String(password), 10),
      location: location ? String(location) : null,
      investmentGoal: investmentGoal ? String(investmentGoal) : null,
      role: "USER",
      isActive: false,
    },
  });

  return NextResponse.json({
    ok: true,
    pendingApproval: true,
    message: PENDING_APPROVAL_MESSAGE,
    user: { id: user.id, email: user.email, isActive: user.isActive },
  });
}
