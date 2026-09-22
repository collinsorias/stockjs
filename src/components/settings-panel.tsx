"use client";

import { X } from "lucide-react";

type SettingsPanelProps = {
  onClose: () => void;
};

export function SettingsPanel({ onClose }: SettingsPanelProps) {
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Full name</label>
          <input
            defaultValue="Jordan Lee"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input
            defaultValue="jordan@example.com"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-slate-300">New password</label>
          <input
            type="password"
            placeholder="Enter a new password"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />
        </div>
      </div>
    </section>
  );
}
