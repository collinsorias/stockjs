"use client";

import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { TransactionStatusBadge } from "@/components/transaction-status-badge";
import { TransactionSummaryCards } from "@/components/superaccess/transaction-summary-cards";
import {
  formatAmount,
  formatTransactionDateTime,
  summarizeTransactions,
  transactionTypeLabel,
  type SuperaccessTransaction,
  type TransactionStatus,
} from "@/lib/transactions";

type FilterKey = "ALL" | TransactionStatus;

type TransactionsPanelProps = {
  transactions: SuperaccessTransaction[];
  isLoading: boolean;
  onApprove: (transactionId: string) => Promise<boolean>;
  onReject: (transactionId: string) => Promise<boolean>;
  onReset: (transactionId: string) => Promise<boolean>;
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

export function TransactionsPanel({
  transactions,
  isLoading,
  onApprove,
  onReject,
  onReset,
}: TransactionsPanelProps) {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const summary = useMemo(() => summarizeTransactions(transactions), [transactions]);

  const visibleTransactions = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (filter !== "ALL" && transaction.status !== filter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return (
        transaction.userName.toLowerCase().includes(needle) ||
        transaction.userEmail.toLowerCase().includes(needle)
      );
    });
  }, [transactions, filter, query]);

  function filterCount(key: FilterKey): number {
    if (key === "ALL") {
      return summary.total;
    }

    return summary[key.toLowerCase() as "pending" | "approved" | "rejected"];
  }

  async function runAction(
    transactionId: string,
    action: (id: string) => Promise<boolean>,
  ): Promise<void> {
    setBusyId(transactionId);
    setActionError("");

    const ok = await action(transactionId);

    if (!ok) {
      setActionError("Could not update that request. Please try again.");
    }

    setBusyId(null);
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900 p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Incoming requests</h2>
          <p className="mt-1 text-sm text-slate-400">
            Every deposit and withdrawal submitted by a user. Nothing settles until you decide.
          </p>
        </div>

        <label className="relative block w-full md:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500"
          />
        </label>
      </div>

      <TransactionSummaryCards summary={summary} />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive ? "bg-cyan-400/20 text-cyan-100" : "bg-slate-800 text-slate-300"
                }`}
              >
                {filterCount(key)}
              </span>
            </button>
          );
        })}
      </div>

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 py-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading requests...
        </div>
      ) : visibleTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 px-4 py-12 text-center">
          <p className="text-sm font-medium text-slate-300">
            {transactions.length === 0 ? "No requests yet" : "No requests match this view"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {transactions.length === 0
              ? "Deposit and withdrawal requests will appear here as users submit them."
              : "Try a different status filter or clear the search box."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Reviewed</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-900/50 text-sm text-slate-200">
                {visibleTransactions.map((transaction) => {
                  const isBusy = busyId === transaction.id;
                  const isPending = transaction.status === "PENDING";

                  return (
                    <tr key={transaction.id} className="hover:bg-slate-800/60">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{transaction.userName}</div>
                        <div className="text-xs text-slate-400">{transaction.userEmail}</div>
                        {transaction.note ? (
                          <div className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                            Note: {transaction.note}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                            transaction.type === "DEPOSIT"
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-400/30 bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {transactionTypeLabel(transaction.type)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold ${
                            transaction.type === "DEPOSIT" ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {transaction.type === "DEPOSIT" ? "+" : "-"}
                          {formatAmount(transaction.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <TransactionStatusBadge status={transaction.status} />
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-400">
                        {formatTransactionDateTime(transaction.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-400">
                        {isPending ? "—" : formatTransactionDateTime(transaction.updatedAt)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {isBusy ? (
                            <span className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving
                            </span>
                          ) : isPending ? (
                            <>
                              <button
                                onClick={() => void runAction(transaction.id, onApprove)}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => void runAction(transaction.id, onReject)}
                                className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => void runAction(transaction.id, onReset)}
                              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                              title="Return this request to the pending queue"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
