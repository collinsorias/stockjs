import { ArrowDownRight, ArrowUpRight, CheckCircle2, Hourglass } from "lucide-react";

import { formatAmount, type TransactionSummary } from "@/lib/transactions";

type TransactionSummaryCardsProps = {
  summary: TransactionSummary;
};

export function TransactionSummaryCards({ summary }: TransactionSummaryCardsProps) {
  const netSettled = summary.approvedDepositTotal - summary.approvedWithdrawalTotal;

  const cards = [
    {
      label: "Awaiting review",
      value: `${summary.pending}`,
      hint: summary.pending > 0 ? "Requests need a decision" : "Nothing waiting on you",
      Icon: Hourglass,
      tone: "amber",
    },
    {
      label: "Pending deposits",
      value: formatAmount(summary.pendingDepositTotal),
      hint: "Held until approved",
      Icon: ArrowDownRight,
      tone: "emerald",
    },
    {
      label: "Pending withdrawals",
      value: formatAmount(summary.pendingWithdrawalTotal),
      hint: "Held until approved",
      Icon: ArrowUpRight,
      tone: "rose",
    },
    {
      label: "Settled net",
      value: formatAmount(netSettled),
      hint: `${summary.approved} approved · ${summary.rejected} rejected`,
      Icon: CheckCircle2,
      tone: "cyan",
    },
  ] as const;

  const toneStyles: Record<(typeof cards)[number]["tone"], string> = {
    amber: "bg-amber-500/10 text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-300",
    rose: "bg-rose-500/10 text-rose-300",
    cyan: "bg-cyan-500/10 text-cyan-300",
  };

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, hint, Icon, tone }) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{label}</span>
            <span className={`rounded-full p-2 ${toneStyles[tone]}`}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{hint}</div>
        </div>
      ))}
    </section>
  );
}
