import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifySuperaccess } from "@/lib/superaccess";
import { MAX_TRANSACTION_AMOUNT, MIN_TRANSACTION_AMOUNT } from "@/lib/transactions";

const MAX_NOTE_LENGTH = 200;

/**
 * Credit or debit a single user's balance from the superaccess panel.
 *
 * Balance is derived from approved transactions, so an adjustment is recorded
 * as a transaction that is APPROVED the moment it is created - that keeps the
 * ledger the single source of truth (the user's own history and the panel's
 * balance figures both read from it). A credit is an APPROVED deposit, a debit
 * an APPROVED withdrawal.
 */
export async function POST(request: Request) {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, type, amount, note } = body ?? {};

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (type !== "CREDIT" && type !== "DEBIT") {
      return NextResponse.json(
        { error: "Adjustment type must be CREDIT or DEBIT" },
        { status: 400 },
      );
    }

    const parsedAmount = typeof amount === "number" ? amount : Number(amount);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount < MIN_TRANSACTION_AMOUNT ||
      parsedAmount > MAX_TRANSACTION_AMOUNT
    ) {
      return NextResponse.json(
        { error: `Enter an amount between $${MIN_TRANSACTION_AMOUNT} and $${MAX_TRANSACTION_AMOUNT}` },
        { status: 400 },
      );
    }

    const roundedAmount = Math.round(parsedAmount * 100) / 100;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        return null;
      }

      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          type: type === "CREDIT" ? "DEPOSIT" : "WITHDRAWAL",
          amount: roundedAmount,
          // Adjustment is applied immediately, unlike a user-initiated request.
          status: "APPROVED",
          // Store the admin's note verbatim; an empty note is stored as null
          // rather than being replaced with a generated default.
          note:
            typeof note === "string" && note.trim().length > 0
              ? note.trim().slice(0, MAX_NOTE_LENGTH)
              : null,
          reviewedAt: new Date(),
        },
      });

      // Recompute this user's settled balance so the panel can update the row
      // without a full reload.
      const settled = await tx.transaction.findMany({
        where: { userId: user.id, status: "APPROVED" },
        select: { type: true, amount: true },
      });

      const balance = settled.reduce(
        (total, item) => (item.type === "DEPOSIT" ? total + item.amount : total - item.amount),
        0,
      );

      return { user, transaction, balance };
    });

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: result.user.id,
      balance: result.balance,
      transactionId: result.transaction.id,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.error(err);
    return NextResponse.json({ error: "Failed to adjust balance" }, { status: 500 });
  }
}