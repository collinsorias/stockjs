import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

/**
 * The default test account, guaranteed to exist from the first time the
 * superaccess panel is opened. It is seeded automatically inside the users
 * fetch, so a fresh deployment shows a usable account immediately - no
 * refresh or manual spawn step needed.
 *
 * Balance is not a column on User: it is derived from APPROVED transactions
 * (see computeSettledBalance), so the opening balance is stored as an
 * already-approved deposit.
 */
export const DEFAULT_TEST_USER = {
  name: "Test User",
  email: "admin123@example.com",
  password: "admin123",
  openingBalance: 25_000,
} as const;

type EnsureResult = { created: boolean };

// Memoizes the seed within one process so parallel panel loads do not race.
// Cross-process races are covered by the unique email on User (P2002 below).
let seedPromise: Promise<EnsureResult> | null = null;

export function ensureDefaultTestUser(): Promise<EnsureResult> {
  if (!seedPromise) {
    seedPromise = ensureDefaultTestUserOnce().catch((err) => {
      // Drop the memoized promise on failure so a later request can retry
      // (e.g. the database was briefly unreachable at cold start).
      seedPromise = null;
      throw err;
    });
  }

  return seedPromise;
}

async function ensureDefaultTestUserOnce(): Promise<EnsureResult> {
  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_TEST_USER.email },
    select: { id: true },
  });

  if (existing) {
    return { created: false };
  }

  const passwordHash = await bcrypt.hash(DEFAULT_TEST_USER.password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: DEFAULT_TEST_USER.name,
          email: DEFAULT_TEST_USER.email,
          passwordHash,
          role: "USER",
          isActive: false,
        },
        select: { id: true },
      });

      // The opening balance only counts once it is settled, so the deposit
      // is created APPROVED rather than PENDING.
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: DEFAULT_TEST_USER.openingBalance,
          status: "APPROVED",
          note: "Opening balance",
          reviewedAt: new Date(),
        },
      });
    });

    return { created: true };
  } catch (err) {
    // Another serverless instance won the race on the unique email; the
    // account exists either way, which is all the caller needs to know.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { created: false };
    }

    throw err;
  }
}
