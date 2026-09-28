"use client";

import { Bitcoin, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

type DepositAddressModalProps = {
  onClose: () => void;
};

/**
 * Edit the Bitcoin deposit address shown on the user dashboard. The field is
 * pre-filled from the server so the admin always edits the value that is
 * actually live rather than an empty box that would silently overwrite it.
 */
export function DepositAddressModal({ onClose }: DepositAddressModalProps) {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/superaccess/settings/deposit-address", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || typeof data.address !== "string") {
          throw new Error(data.error ?? "Failed to load deposit address");
        }

        if (!cancelled) {
          setAddress(data.address);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load deposit address");
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/superaccess/settings/deposit-address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to update deposit address");
        return;
      }

      setAddress(data.address ?? address);
      setSuccess("Deposit address updated");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Super access</p>
            <h3 className="mt-1 flex items-center gap-2 text-xl font-bold text-white">
              <Bitcoin className="h-5 w-5 shrink-0" />
              Bitcoin deposit address
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Shown to every user on their dashboard and used for deposits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Deposit address</label>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              disabled={isLoading || isSubmitting}
              spellCheck={false}
              autoComplete="off"
              placeholder={isLoading ? "Loading..." : "bc1…"}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 disabled:opacity-60"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          ) : null}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Saving..." : "Save address"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}