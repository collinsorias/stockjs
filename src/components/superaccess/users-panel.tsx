"use client";

import { Loader2, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export type SuperaccessUser = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: string;
};

type UsersPanelProps = {
  users: SuperaccessUser[];
  isLoading: boolean;
  onToggleActive: (userId: string, isActive: boolean) => Promise<boolean>;
  onDelete: (userId: string) => Promise<boolean>;
};

export function UsersPanel({ users, isLoading, onToggleActive, onDelete }: UsersPanelProps) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

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
            Activate new sign-ups, disable accounts, or remove them entirely.
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
    </section>
  );
}
