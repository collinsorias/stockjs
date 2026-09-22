import { getSession, normalizeRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActiveSessionUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

/**
 * Resolve the signed-in user for a route handler. Unlike `requireSession`,
 * this never redirects: API routes must answer with a status code, so callers
 * get `null` and decide whether that means 401 or 403.
 *
 * A cookie alone is not sufficient - accounts that were disabled (or are still
 * awaiting activation) lose access immediately.
 */
export async function getActiveSessionUser(): Promise<ActiveSessionUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
  };
}
