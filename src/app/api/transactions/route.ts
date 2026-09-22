import { NextResponse } from "next/server";

import { getActiveSessionUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  isTransactionType,
  parseTransactionAmount,
  type TransactionRecord,
  type TransactionStatus,
  type TransactionType,
} from "@/lib/transactions";

const MAX_NOTE_LENGTH = 200;

type RawTransaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toRecord(transaction: RawTransaction): TransactionRecord {
  return {
    id: transaction.id,
    type: transaction.type as TransactionType,
    amount: transaction.amount,
    status: transaction.status as TransactionStatus,
    note: transaction.note,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

function sanitizeNote(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().slice(0, MAX_NOTE_LENGTH);

  return trimmed.length > 0 ? trimmed : null;
}

export async function GET() {
  const user = await getActiveSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      transactions: transactions.map((transaction) => toRecord(transaction as RawTransaction)),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getActiveSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, amount, note } = body ?? {};

    if (!isTransactionType(type)) {
      return NextResponse.json(
        { error: "Transaction type must be DEPOSIT or WITHDRAWAL" },
        { status: 400 },
      );
    }

    const parsedAmount = parseTransactionAmount(amount);

    if (parsedAmount === null) {
      return NextResponse.json(
        { error: "Enter an amount greater than zero" },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type,
        amount: parsedAmount,
        // Every user-initiated request starts life pending. Only an
        // administrator can move it to APPROVED or REJECTED.
        status: "PENDING",
        note: sanitizeNote(note),
      },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { transaction: toRecord(transaction as RawTransaction) },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
