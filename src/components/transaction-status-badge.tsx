import { Clock, ShieldCheck, ShieldX } from "lucide-react";

import { transactionStatusLabel, type TransactionStatus } from "@/lib/transactions";

const STATUS_STYLES: Record<TransactionStatus, { className: string; Icon: typeof Clock }> = {
  PENDING: {
    className: "border-amber-400/30 bg-amber-500/10 text-amber-300",
    Icon: Clock,
  },
  APPROVED: {
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    Icon: ShieldCheck,
  },
  REJECTED: {
    className: "border-rose-400/30 bg-rose-500/10 text-rose-300",
    Icon: ShieldX,
  },
};

type TransactionStatusBadgeProps = {
  status: TransactionStatus;
};

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const { className, Icon } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {transactionStatusLabel(status)}
    </span>
  );
}
