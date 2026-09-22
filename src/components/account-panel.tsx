"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { BalanceSparklines } from "@/components/balance-sparklines";
import { TransactionStatusBadge } from "@/components/transaction-status-badge";
import { formatCurrency } from "@/lib/format";
import {
  formatAmount,
  formatTransactionAmount,
  formatTransactionDate,
  transactionTypeLabel,
  type TransactionRecord,
  type TransactionType,
} from "@/lib/transactions";

const DEPOSIT_ADDRESS = "bc1q2kgcxkkhjeammrux3al9zs5mz292w8c6feczre";

type AccountPanelProps = {
  balance: number;
  transactions: TransactionRecord[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onRefresh: () => void;
  onSubmit: (
    type: TransactionType,
    amount: number,
    note?: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function AccountPanel({
  balance,
  transactions,
  isLoading,
  isSubmitting,
  error,
  onClose,
  onRefresh,
  onSubmit,
}: AccountPanelProps) {
  const [mode, setMode] = useState<TransactionType | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const pendingDeposits = transactions.filter(
    (transaction) => transaction.status === "PENDING" && transaction.type === "DEPOSIT",
  );
  const pendingWithdrawals = transactions.filter(
    (transaction) => transaction.status === "PENDING" && transaction.type === "WITHDRAWAL",
  );
  const pendingTotal = transactions.filter((transaction) => transaction.status === "PENDING");
  const hasSettledFunds = balance > 0;

  function resetForm() {
    setMode(null);
    setAmountInput("");
    setNoteInput("");
    setFormError("");
  }

  function startRequest(nextMode: TransactionType) {
    setMode(nextMode);
    setAmountInput("");
    setNoteInput("");
    setFormError("");
    setFormSuccess("");
  }

  async function handleSubmit() {
    if (!mode) {
      return;
    }

    const amount = Number(amountInput);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    setFormError("");

    const result = await onSubmit(mode, amount, noteInput);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setFormSuccess(
      mode === "DEPOSIT"
        ? ""
        : "",
    );
    resetForm();
  }

  return (
    <section className="mb-8 rounded-[30px] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-2xl shadow-cyan-950/20">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
            Bitcoin deposit address
          </p>
          <p className="mt-2 break-all font-mono text-sm text-slate-300">{DEPOSIT_ADDRESS}</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Account overview</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            aria-label="Refresh transactions"
            title="Refresh transactions"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <span>{error}</span>
          <button
            onClick={onRefresh}
            className="ml-4 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium hover:bg-rose-500/30"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
            <span>Current Balance</span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              Active
              <Image
                src="/vbadge.svg"
                alt=""
                aria-hidden
                width={20}
                height={20}
                unoptimized
                className="h-5 w-5 shrink-0"
              />
            </span>
          </div>

          <div className="flex items-end gap-3">
            <div className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              {formatCurrency(balance)}
            </div>
            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-400">
              <Wallet className="h-3.5 w-3.5" />
              
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-300">
                <ArrowDownRight className="h-3.5 w-3.5" />
                Pending deposits
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                {formatAmount(
                  pendingDeposits.reduce((total, item) => total + item.amount, 0),
                )}
              </div>
              <div className="text-xs text-slate-400">
                {pendingDeposits.length} request{pendingDeposits.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-rose-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Pending withdrawals
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                {formatAmount(
                  pendingWithdrawals.reduce((total, item) => total + item.amount, 0),
                )}
              </div>
              <div className="text-xs text-slate-400">
                {pendingWithdrawals.length} request{pendingWithdrawals.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {formSuccess ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {formSuccess}
            </div>
          ) : null}

          {!mode ? (
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => startRequest("DEPOSIT")}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Deposit
              </button>
              <button
                onClick={() => startRequest("WITHDRAWAL")}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
              >
                <Minus className="h-4 w-4" />
                Withdraw
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-200">
                  {mode === "DEPOSIT" ? "Deposit amount" : "Withdrawal amount"}
                </label>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    mode === "DEPOSIT"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  verified
                </span>
              </div>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="Enter amount"
                disabled={isSubmitting}
              />

              <input
                type="text"
                value={noteInput}
                onChange={(event) => setNoteInput(event.target.value)}
                maxLength={200}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="Optional note (e.g. funding source)"
                disabled={isSubmitting}
              />

              {formError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {formError}
                </div>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                    mode === "DEPOSIT"
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      : "border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4" />
                  )}
                  {isSubmitting
                    ? "Submitting..."
                    : mode === "DEPOSIT"
                      ? "Submit deposit request"
                      : "Submit withdrawal request"}
                </button>
                <button
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <BalanceSparklines visible={hasSettledFunds} />
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Transaction History</h3>
              <p className="text-xs text-slate-400">
                {pendingTotal.length > 0
                  ? ``
                  : ""}
              </p>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
              {transactions.length} total
            </span>
          </div>

          {isLoading && transactions.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 py-10 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-300">No requests yet</p>
              <p className="mt-1 text-xs text-slate-500">  
              </p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left">
                <thead className="sticky top-0 bg-slate-950/95 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-800/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">
                          {transactionTypeLabel(transaction.type)}
                        </div>
                        {transaction.note ? (
                          <div className="max-w-[180px] truncate text-xs text-slate-500">
                            {transaction.note}
                          </div>
                        ) : null}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          transaction.type === "DEPOSIT" ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {formatTransactionAmount(transaction.type, transaction.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatTransactionDate(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <TransactionStatusBadge status={transaction.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
