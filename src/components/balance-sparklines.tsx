"use client";

const BALANCE_STATS = [
  {
    label: "Total value",
    color: "#22d3ee",
    series: [18, 23, 21, 29, 32, 30, 36, 34, 40, 42],
  },
  {
    label: "Invested",
    color: "#38bdf8",
    series: [12, 17, 15, 20, 25, 24, 28, 33, 30, 37],
  },
  {
    label: "Cash reserve",
    color: "#34d399",
    series: [8, 10, 14, 13, 17, 18, 22, 21, 24, 28],
  },
];

const CHART_WIDTH = 90;
const CHART_HEIGHT = 34;

function createSparklinePath(values: number[], width = CHART_WIDTH, height = CHART_HEIGHT) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

type BalanceSparklinesProps = {
  /** Allocation figures stay hidden until the account holds settled funds. */
  visible: boolean;
};

export function BalanceSparklines({ visible }: BalanceSparklinesProps) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {BALANCE_STATS.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
          <div className="mt-2 text-lg font-semibold text-white">
            {visible ? `${item.series[item.series.length - 1]}%` : "--%"}
          </div>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="mt-3 h-9 w-full"
            preserveAspectRatio="none"
            aria-label={`${item.label} trend`}
          >
            <path
              d={createSparklinePath(item.series)}
              fill="none"
              stroke={item.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
