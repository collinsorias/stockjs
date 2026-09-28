"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { formatSignedAmount, MIN_TRANSACTION_AMOUNT } from "@/lib/transactions";

export type SuperaccessUser = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: string;
  balance: number;
};

export type BalanceAdjustment = {
  type: "CREDIT" | "DEBIT";
  amount: number;
};

type UsersPanelProps = {
  users: SuperaccessUser[];
  isLoading: boolean;
  onToggleActive: (userId: string, isActive: boolean) => Promise<boolean>;
  onDelete: (userId: string) => Promise<boolean>;
  onAdjustBalance: (
    userId: string,
    adjustment: BalanceAdjustment,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function UsersPanel({
  users,
  isLoading,
  onToggleActive,
  onDelete,
  onAdjustBalance,
}: UsersPanelProps) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  // The user whose balance modal is open, captured by id so the row can be
  // removed or refreshed underneath without closing the modal.
  const [adjustTargetId, setAdjustTargetId] = useState<string | null>(null);

  const adjustTarget = users.find((user) => user.id === adjustTargetId) ?? null;

  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle),
    );
  }, [users, query]);

  async function runAction(userId: string, action: () => Promise<boolean>): Promise<void> {
    setBusyId(userId);
    await action();
    setBusyId(null);
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900 p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User management</h2>
          <p className="mt-1 text-sm text-slate-400">
            Activate new sign-ups, adjust balances, disable accounts, or remove them entirely.
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

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 py-12 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading users...
        </div>
      ) : visibleUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 px-4 py-12 text-center">
          <p className="text-sm font-medium text-slate-300">
            {users.length === 0 ? "No users yet" : "No users match your search"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {users.length === 0
              ? "Accounts appear here as people sign up."
              : "Try a different name or email."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-900/50 text-sm text-slate-200">
                {visibleUsers.map((user) => {
                  const isBusy = busyId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/60">
                      <td className="px-4 py-4 font-semibold text-white">{user.name}</td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold tabular-nums ${
                            user.balance < 0 ? "text-rose-300" : "text-emerald-300"
                          }`}
                        >
                          ${currencyFormatter.format(user.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {isBusy ? (
                            <span className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => setAdjustTargetId(user.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                                title="Credit or debit this user's balance"
                              >
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                                Balance
                              </button>
                              <button
                                onClick={() =>
                                  void runAction(user.id, () =>
                                    onToggleActive(user.id, !user.isActive),
                                  )
                                }
                                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                              >
                                {user.isActive ? (
                                  <>
                                    <ToggleRight className="h-3.5 w-3.5" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="h-3.5 w-3.5" />
                                    Activate
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => void runAction(user.id, () => onDelete(user.id))}
                                className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </>
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

      {adjustTarget ? (
        <BalanceAdjustModal
          user={adjustTarget}
          onClose={() => setAdjustTargetId(null)}
          onSubmit={(adjustment) => onAdjustBalance(adjustTarget.id, adjustment)}
        />
      ) : null}
    </section>
  );
}

type BalanceAdjustModalProps = {
  user: SuperaccessUser;
  onClose: () => void;
  onSubmit: (
    adjustment: BalanceAdjustment,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

function BalanceAdjustModal({ user, onClose, onSubmit }: BalanceAdjustModalProps) {
  const [type, setType] = useState<BalanceAdjustment["type"]>("CREDIT");
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live preview of where the balance lands, so the admin can sanity-check
  // before committing an irreversible ledger entry.
  const parsedPreview = Number(amountInput);
  const previewBalance =
    Number.isFinite(parsedPreview) && parsedPreview > 0
      ? user.balance + (type === "CREDIT" ? parsedPreview : -parsedPreview)
      : null;

  async function handleSubmit() {
    const amount = Number(amountInput);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    if (amount < MIN_TRANSACTION_AMOUNT) {
      setError(`Minimum adjustment is $${MIN_TRANSACTION_AMOUNT}.`);
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result = await onSubmit({ type, amount });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Adjust balance</p>
            <h3 className="mt-1 truncate text-xl font-bold text-white">{user.name}</h3>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
          <span className="text-sm text-slate-400">Current balance</span>
          <span className="font-semibold tabular-nums text-white">
            ${currencyFormatter.format(user.balance)}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setType("CREDIT")}
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
              type === "CREDIT"
                ? "bg-emerald-500 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Credit
          </button>
          <button
            onClick={() => setType("DEBIT")}
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
              type === "DEBIT"
                ? "bg-rose-500 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Debit
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            placeholder="Amount"
            disabled={isSubmitting}
          />

          <input
            type="text"
            value={noteInput}
            onChange={(event) => setNoteInput(event.target.value)}
            maxLength={200}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            placeholder="Optional note (e.g. reason for adjustment)"
            disabled={isSubmitting}
          />

          {previewBalance !== null ? (
            <p className="text-xs text-slate-400">
              New balance will be{" "}
              <span
                className={`font-semibold tabular-nums ${
                  previewBalance < 0 ? "text-rose-300" : "text-emerald-300"
                }`}
              >
                ${currencyFormatter.format(previewBalance)}
              </span>{" "}
              ({formatSignedAmount(type === "CREDIT" ? parsedPreview : -parsedPreview)})
            </p>
          ) : null}

          {previewBalance !== null && previewBalance < 0 ? (
            <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              This debit takes the balance below zero.
            </p>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                type === "CREDIT"
                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  : "bg-rose-500 text-slate-950 hover:bg-rose-400"
              }`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting
                ? "Applying..."
                : type === "CREDIT"
                  ? "Credit balance"
                  : "Debit balance"}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
