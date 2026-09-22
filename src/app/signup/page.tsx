"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, LogIn } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

const FALLBACK_PENDING_MESSAGE =
  "Your account has been created and is awaiting administrator approval. You will be able to sign in once it has been activated.";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        location: formData.get("location"),
        investmentGoal: formData.get("investmentGoal"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "Signup failed");
      return;
    }

    setPendingMessage(typeof result.message === "string" ? result.message : FALLBACK_PENDING_MESSAGE);
  }

  if (pendingMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl shadow-cyan-950/30">
          <div className="flex justify-center">
          
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-white">Account created</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300"></p>

          <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center text-sm text-slate-400">
            Awaiting Review.
          </p>

          <Link
            href="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <LogIn className="h-4 w-4" />
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/30">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400"></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
              <input id="name" name="name" type="text" required className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500" placeholder="Jordan Lee" />
            </div>
            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-slate-200">Location</label>
              <input id="location" name="location" type="text" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500" placeholder="New York" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="investmentGoal" className="mb-2 block text-sm font-medium text-slate-200">Investment goal</label>
            <input id="investmentGoal" name="investmentGoal" type="text" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500" placeholder="Long-term growth" />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500" placeholder="Minimum 8 characters" />
          </div>

          {error ? <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New accounts are reviewed.
        </p>

        <p className="mt-2 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="font-semibold text-cyan-300">Login</Link>
        </p>
      </div>
    </main>
  );
}
