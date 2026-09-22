"use client";

import { LogOut, RefreshCw, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChangePasswordModal } from "@/components/superaccess/change-password-modal";
import { TransactionsPanel } from "@/components/superaccess/transactions-panel";
import { UsersPanel, type SuperaccessUser } from "@/components/superaccess/users-panel";
import {
  summarizeTransactions,
  type SuperaccessTransaction,
  type TransactionStatus,
} from "@/lib/transactions";

type PanelTab = "users" | "requests";

export default function SuperaccessPage() {
  const router = useRouter();
  const [users, setUsers] = useState<SuperaccessUser[]>([]);
  const [transactions, setTransactions] = useState<SuperaccessTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<PanelTab>("users");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Once the first load lands, surface the requests queue when it needs a
  // decision. After that the admin's own tab choice wins.
  const defaultTabApplied = useRef(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [usersResponse, transactionsResponse] = await Promise.all([
        fetch("/api/superaccess/users", { cache: "no-store" }),
        fetch("/api/superaccess/transactions", { cache: "no-store" }),
      ]);

      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users (${usersResponse.status})`);
      }

      if (!transactionsResponse.ok) {
        throw new Error(`Failed to fetch requests (${transactionsResponse.status})`);
      }

      const usersData = await usersResponse.json();
      const transactionsData = await transactionsResponse.json();

      const nextUsers: SuperaccessUser[] = usersData.users ?? [];
      const nextTransactions: SuperaccessTransaction[] = transactionsData.transactions ?? [];

      setUsers(nextUsers);
      setTransactions(nextTransactions);

      if (!defaultTabApplied.current) {
        defaultTabApplied.current = true;

        if (summarizeTransactions(nextTransactions).pending > 0) {
          setActiveTab("requests");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
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

        const [usersResponse, transactionsResponse] = await Promise.all([
          fetch("/api/superaccess/users", { cache: "no-store" }),
          fetch("/api/superaccess/transactions", { cache: "no-store" }),
        ]);

        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch users (${usersResponse.status})`);
        }

        if (!transactionsResponse.ok) {
          throw new Error(`Failed to fetch requests (${transactionsResponse.status})`);
        }

        const usersData = await usersResponse.json();
        const transactionsData = await transactionsResponse.json();

        const nextUsers: SuperaccessUser[] = usersData.users ?? [];
        const nextTransactions: SuperaccessTransaction[] = transactionsData.transactions ?? [];

        if (cancelled) {
          return;
        }

        setUsers(nextUsers);
        setTransactions(nextTransactions);

        if (!defaultTabApplied.current) {
          defaultTabApplied.current = true;

          if (summarizeTransactions(nextTransactions).pending > 0) {
            setActiveTab("requests");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
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
  }, []);

  const updateTransactionStatus = useCallback(
    async (transactionId: string, status: TransactionStatus): Promise<boolean> => {
      try {
        const response = await fetch("/api/superaccess/transactions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, status }),
        });

        const data = await response.json();

        if (!response.ok || !data.transaction) {
          return false;
        }

        const updated = data.transaction as SuperaccessTransaction;
        setTransactions((current) =>
          current.map((transaction) => (transaction.id === transactionId ? updated : transaction)),
        );

        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const handleApproveTransaction = useCallback(
    (transactionId: string) => updateTransactionStatus(transactionId, "APPROVED"),
    [updateTransactionStatus],
  );

  const handleRejectTransaction = useCallback(
    (transactionId: string) => updateTransactionStatus(transactionId, "REJECTED"),
    [updateTransactionStatus],
  );

  const handleReopenTransaction = useCallback(
    (transactionId: string) => updateTransactionStatus(transactionId, "PENDING"),
    [updateTransactionStatus],
  );

  const handleToggleUserActive = useCallback(
    async (userId: string, isActive: boolean): Promise<boolean> => {
      try {
        const response = await fetch("/api/superaccess/users/toggle-active", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, isActive }),
        });

        if (!response.ok) {
          return false;
        }

        setUsers((current) =>
          current.map((user) => (user.id === userId ? { ...user, isActive } : user)),
        );

        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const handleDeleteUser = useCallback(async (userId: string): Promise<boolean> => {
    const confirmed = window.confirm(
      "Delete this user? Their transaction history will be removed too. This cannot be undone.",
    );

    if (!confirmed) {
      // Treated as handled so the panel does not report a spurious failure.
      return true;
    }

    try {
      const response = await fetch("/api/superaccess/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        return false;
      }

      setUsers((current) => current.filter((user) => user.id !== userId));
      setTransactions((current) =>
        current.filter((transaction) => transaction.userId !== userId),
      );

      return true;
    } catch {
      return false;
    }
  }, []);

  const handleLogout = useCallback(() => {
    fetch("/api/superaccess/logout", { method: "POST" }).finally(() => {
      router.push("/superaccess/login");
    });
  }, [router]);

  const requestSummary = summarizeTransactions(transactions);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Super access</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Panel</h1>
            <p className="mt-1 text-sm text-slate-400">
              {requestSummary.pending > 0
                ? `${requestSummary.pending} request${requestSummary.pending === 1 ? "" : "s"} awaiting your decision`
                : "No requests awaiting review"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => void loadData()}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 rounded-full border border-slate-500/30 bg-slate-500/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-500/20"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <span>{error}</span>
            <button
              onClick={() => void loadData()}
              className="ml-4 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mb-6 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition ${
              activeTab === "requests"
                ? "border-b-2 border-cyan-500 text-cyan-300"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Requests
            {requestSummary.pending > 0 ? (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950">
                {requestSummary.pending}
              </span>
            ) : (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                {requestSummary.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition ${
              activeTab === "users"
                ? "border-b-2 border-cyan-500 text-cyan-300"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Users
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === "users" ? "bg-cyan-500/20 text-cyan-100" : "bg-slate-800 text-slate-400"
              }`}
            >
              {users.length}
            </span>
          </button>
        </div>

        {activeTab === "requests" ? (
          <TransactionsPanel
            transactions={transactions}
            isLoading={isLoading}
            onApprove={handleApproveTransaction}
            onReject={handleRejectTransaction}
            onReset={handleReopenTransaction}
          />
        ) : (
          <UsersPanel
            users={users}
            isLoading={isLoading}
            onToggleActive={handleToggleUserActive}
            onDelete={handleDeleteUser}
          />
        )}

        {showSettings ? <ChangePasswordModal onClose={() => setShowSettings(false)} /> : null}
      </div>
    </main>
  );
}
