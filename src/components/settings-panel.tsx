"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

type SettingsPanelProps = {
  onClose: () => void;
};

type ProfileResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  error?: string;
};

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Pull the account's own name and email so the fields show what is actually
  // stored on the user record rather than a shared placeholder.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/account/profile", { cache: "no-store" });
        const data = (await response.json()) as ProfileResponse;

        if (!response.ok || !data.user) {
          throw new Error(data.error ?? "Failed to load your account details");
        }

        if (!cancelled) {
          setName(data.user.name);
          setEmail(data.user.email);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load your account details");
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

  return (
    <section className="mb-8 rounded-[24px] border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Account settings</h3>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-300">
            Secure
          </span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="settings-name" className="mb-2 block text-sm text-slate-300">
            Full name
          </label>
          <input
            id="settings-name"
            value={name}
            readOnly
            disabled={isLoading}
            placeholder={isLoading ? "Loading..." : ""}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="settings-email" className="mb-2 block text-sm text-slate-300">
            Email
          </label>
          <input
            id="settings-email"
            type="email"
            value={email}
            readOnly
            disabled={isLoading}
            placeholder={isLoading ? "Loading..." : ""}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500 disabled:opacity-60"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="settings-password" className="mb-2 block text-sm text-slate-300">
            New password
          </label>
          <input
            id="settings-password"
            type="password"
            placeholder="Enter a new password"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading your account details...
        </p>
      ) : null}
    </section>
  );
}
