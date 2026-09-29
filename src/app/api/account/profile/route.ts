import { NextResponse } from "next/server";

import { getActiveSessionUser } from "@/lib/api-auth";

/**
 * Returns the signed-in user's own account details.
 *
 * The dashboard settings panel needs the real name and email that were stored
 * on the account at signup, rather than a placeholder. Reading them from the
 * session we already resolve here keeps the panel correct for every account,
 * including ones created directly by an administrator.
 */
export async function GET() {
  const user = await getActiveSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}