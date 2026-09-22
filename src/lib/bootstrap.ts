import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

// Guards against re-creating the default admin on every call within a process
// and against concurrent invocations racing each other.
let bootstrapPromise: Promise<unknown> | null = null;

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@stockjs.local";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;

/**
 * Seed an initial administrator account.
 *
 * This is opt-in and never runs automatically: a known-password admin account
 * created behind the operator's back is a production risk. It also requires an
 * explicit password, so no guessable default can be deployed by accident.
 */
export async function ensureDefaultAdmin() {
  if (!bootstrapPromise) {
    bootstrapPromise = ensureDefaultAdminOnce();
  }

  return bootstrapPromise;
}

async function ensureDefaultAdminOnce() {
  if (!DEFAULT_ADMIN_PASSWORD) {
    throw new Error(
      "DEFAULT_ADMIN_PASSWORD is not set. Refusing to seed the default admin with a guessable password.",
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN_EMAIL },
  });

  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: {
      name: "System Admin",
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10),
      role: "ADMIN",
      location: "New York",
      investmentGoal: "Long-term portfolio growth",
      isActive: true,
    },
  });
}
