import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { verifySuperaccess } from "@/lib/superaccess";

// The account spawned when the user table is completely empty. It ships with
// no transactions, so its settled balance starts at $0.
const SEED_USER_NAME = "Demo User";
const SEED_USER_EMAIL = "demo@example.com";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export async function GET() {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * Spawn the demo account, but only while the user table has no rows at all.
 * The count and the insert run in one transaction so two admins refreshing at
 * the same moment cannot both create an account. The new user owns no
 * transactions, so their current balance is $0.
 */
export async function POST() {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 16 characters, and the only place this value is ever revealed.
    const generatedPassword = randomBytes(12).toString("base64url");
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const user = await prisma.$transaction(async (tx) => {
      const userCount = await tx.user.count();

      if (userCount > 0) {
        return null;
      }

      return tx.user.create({
        data: {
          name: SEED_USER_NAME,
          email: SEED_USER_EMAIL,
          passwordHash,
          role: "USER",
          isActive: true,
        },
        select: USER_SELECT,
      });
    });

    if (!user) {
      return NextResponse.json(
        { error: "Users already exist" },
        { status: 409 }
      );
    }

    return NextResponse.json({ user, generatedPassword });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = body ?? {};

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
