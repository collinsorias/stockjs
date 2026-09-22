import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifySuperaccess } from "@/lib/superaccess";

export async function POST(request: Request) {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, isActive } = body ?? {};

    if (!userId || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "User ID and active status are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
