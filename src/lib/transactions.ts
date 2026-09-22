/**
 * Shared transaction vocabulary and helpers used by both the user dashboard
 * and the superaccess admin panel. This module is intentionally free of any
 * Prisma or Node-only imports so it can be used from client components too.
 */

export const TRANSACTION_TYPES = ["DEPOSIT", "WITHDRAWAL"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

/** A transaction as it is exposed to the owning user. */
export type TransactionRecord = {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

/** A transaction enriched with the requesting user, as shown to admins. */
export type SuperaccessTransaction = TransactionRecord & {
  userId: string;
  userName: string;
  userEmail: string;
};

export const MIN_TRANSACTION_AMOUNT = 1;
export const MAX_TRANSACTION_AMOUNT = 10_000_000;

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Format a transaction amount with a leading sign matching its direction. */
export function formatTransactionAmount(type: TransactionType, amount: number): string {
  const sign = type === "DEPOSIT" ? "+" : "-";
  return `${sign}$${amountFormatter.format(Math.abs(amount))}`;
}

/** Format a bare amount without a sign, e.g. "$1,250.00". */
export function formatAmount(amount: number): string {
  return `$${amountFormatter.format(Math.abs(amount))}`;
}

export function formatTransactionDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateFormatter.format(date);
}

export function formatTransactionDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateTimeFormatter.format(date);
}

/** Turn a raw string into a valid transaction type, defaulting to DEPOSIT. */
export function normalizeTransactionType(value: unknown): TransactionType {
  return String(value).toUpperCase() === "WITHDRAWAL" ? "WITHDRAWAL" : "DEPOSIT";
}

/** Human readable label, e.g. "Withdrawal". */
export function transactionTypeLabel(type: TransactionType): string {
  return type === "DEPOSIT" ? "Deposit" : "Withdrawal";
}

/** Title-cased status label, e.g. "Pending". */
export function transactionStatusLabel(status: TransactionStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function isTransactionType(value: unknown): value is TransactionType {
  return TRANSACTION_TYPES.includes(value as TransactionType);
}

export function isTransactionStatus(value: unknown): value is TransactionStatus {
  return TRANSACTION_STATUSES.includes(value as TransactionStatus);
}

/** Parse and validate a user supplied amount. Returns null when invalid. */
export function parseTransactionAmount(value: unknown): number | null {
  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  if (amount < MIN_TRANSACTION_AMOUNT || amount > MAX_TRANSACTION_AMOUNT) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

/**
 * Balance is derived from settled transactions only: approved deposits add to
 * the balance, approved withdrawals subtract from it. Pending requests never
 * move the needle until an administrator approves them.
 */
export function computeSettledBalance(transactions: TransactionRecord[]): number {
  return transactions.reduce((total, transaction) => {
    if (transaction.status !== "APPROVED") {
      return total;
    }

    return transaction.type === "DEPOSIT"
      ? total + transaction.amount
      : total - transaction.amount;
  }, 0);
}

/** Sum of amounts still awaiting a decision, grouped by direction. */
export function sumPending(transactions: TransactionRecord[]): {
  deposit: number;
  withdrawal: number;
  count: number;
} {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.status !== "PENDING") {
        return totals;
      }

      totals.count += 1;

      if (transaction.type === "DEPOSIT") {
        totals.deposit += transaction.amount;
      } else {
        totals.withdrawal += transaction.amount;
      }

      return totals;
    },
    { deposit: 0, withdrawal: 0, count: 0 },
  );
}
export type TransactionSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingDepositTotal: number;
  pendingWithdrawalTotal: number;
  approvedDepositTotal: number;
  approvedWithdrawalTotal: number;
};

/** Aggregate counts and settled/pending volumes for the admin overview. */
export function summarizeTransactions(transactions: TransactionRecord[]): TransactionSummary {
  return transactions.reduce<TransactionSummary>(
    (summary, transaction) => {
      summary.total += 1;
      summary[transaction.status.toLowerCase() as "pending" | "approved" | "rejected"] += 1;

      if (transaction.status === "PENDING") {
        if (transaction.type === "DEPOSIT") {
          summary.pendingDepositTotal += transaction.amount;
        } else {
          summary.pendingWithdrawalTotal += transaction.amount;
        }
      }

      if (transaction.status === "APPROVED") {
        if (transaction.type === "DEPOSIT") {
          summary.approvedDepositTotal += transaction.amount;
        } else {
          summary.approvedWithdrawalTotal += transaction.amount;
        }
      }

      return summary;
    },
    {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      pendingDepositTotal: 0,
      pendingWithdrawalTotal: 0,
      approvedDepositTotal: 0,
      approvedWithdrawalTotal: 0,
    },
  );
}
