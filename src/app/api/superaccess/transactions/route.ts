import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifySuperaccess } from "@/lib/superaccess";
import {
  isTransactionStatus,
  type SuperaccessTransaction,
  type TransactionStatus,
  type TransactionType,
} from "@/lib/transactions";

type RawTransaction = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  note: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string; email: string };
};

const TRANSACTION_SELECT = {
  id: true,
  userId: true,
  type: true,
  amount: true,
  status: true,
  note: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { name: true, email: true } },
} satisfies Prisma.TransactionSelect;

function toSuperaccessTransaction(transaction: RawTransaction): SuperaccessTransaction {
  return {
    id: transaction.id,
    userId: transaction.userId,
    userName: transaction.user.name,
    userEmail: transaction.user.email,
    type: transaction.type as TransactionType,
    amount: transaction.amount,
    status: transaction.status as TransactionStatus,
    note: transaction.note,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

export async function GET() {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      select: TRANSACTION_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      transactions: transactions.map((transaction) =>
        toSuperaccessTransaction(transaction as RawTransaction),
      ),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { transactionId, status } = body ?? {};

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: "Transaction ID and status are required" },
        { status: 400 },
      );
    }

    if (!isTransactionStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const transaction = await prisma.transaction.update({
      where: { id: String(transactionId) },
      data: {
        status,
        // A decision is stamped with a review time; moving a request back to
        // pending clears it so the row reads as genuinely un-reviewed again.
        reviewedAt: status === "PENDING" ? null : new Date(),
      },
      select: TRANSACTION_SELECT,
    });

    return NextResponse.json({
      transaction: toSuperaccessTransaction(transaction as RawTransaction),
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    console.error(err);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}
