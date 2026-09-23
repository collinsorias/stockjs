import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifySuperaccess } from "@/lib/superaccess";
import { DEFAULT_TEST_USER, ensureDefaultTestUser } from "@/lib/seed";

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
    // Seed the default test account as part of the very first fetch, so the
    // panel never opens empty and no refresh is needed before the account
    // appears. It is a no-op once the account exists.
    await ensureDefaultTestUser();

    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);

    // This route is only reachable by an authenticated superaccess admin,
    // so echoing the cause makes deployment problems (missing env vars,
    // unapplied migrations) visible in the panel instead of a bare 500.
    const detail = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to fetch users", detail },
      { status: 500 }
    );
  }
}

/**
 * Spawn the default test account. Kept for the panel's explicit seed flow:
 * the GET handler now seeds automatically, so this only matters when the
 * account was deleted. Returns 409 when the account already exists, which
 * tells the client to simply re-read the list.
 */
export async function POST() {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await ensureDefaultTestUser();

    if (!result.created) {
      return NextResponse.json(
        { error: "Users already exist" },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: DEFAULT_TEST_USER.email },
      select: USER_SELECT,
    });

    // The password is the documented default, so surface it to the admin
    // exactly like the old one-shot generated password.
    return NextResponse.json({
      user,
      generatedPassword: DEFAULT_TEST_USER.password,
    });
  } catch (err) {
    console.error(err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create user", detail },
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
