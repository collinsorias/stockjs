"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  computeSettledBalance,
  sumPending,
  type TransactionRecord,
  type TransactionType,
} from "@/lib/transactions";

export type SubmitRequestResult = { ok: true } | { ok: false; error: string };

type TransactionsResponse = {
  transactions?: TransactionRecord[];
  error?: string;
};

type CreateResponse = {
  transaction?: TransactionRecord;
  error?: string;
};

/**
 * Loads the signed-in user's transaction history and exposes a helper for
 * filing new deposit/withdrawal requests. Requests are always stored as
 * PENDING and only move the balance once an administrator approves them.
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/transactions", { cache: "no-store" });
      const data = (await response.json()) as TransactionsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load transactions");
      }

      setTransactions(data.transactions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/transactions", { cache: "no-store" });
        const data = (await response.json()) as TransactionsResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load transactions");
        }

        if (!cancelled) {
          setTransactions(data.transactions ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load transactions");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const submitRequest = useCallback(
    async (type: TransactionType, amount: number, note?: string): Promise<SubmitRequestResult> => {
      try {
        setIsSubmitting(true);

        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, amount, note }),
        });

        const data = (await response.json()) as CreateResponse;

        if (!response.ok || !data.transaction) {
          return { ok: false, error: data.error ?? "Failed to submit request" };
        }

        const created = data.transaction;
        setTransactions((current) => [created, ...current]);

        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const balance = useMemo(() => computeSettledBalance(transactions), [transactions]);
  const pending = useMemo(() => sumPending(transactions), [transactions]);
  const hasActivity = transactions.length > 0;

  return {
    transactions,
    balance,
    pending,
    hasActivity,
    isLoading,
    isSubmitting,
    error,
    submitRequest,
    refresh,
  };
}
