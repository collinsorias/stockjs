"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Bell,
  Briefcase,
  ChevronDown,
  CreditCard,
  DollarSign,
  Landmark,
  LineChart,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { AccountPanel } from "@/components/account-panel";
import { BrandLogo } from "@/components/brand-logo";
import { SettingsPanel } from "@/components/settings-panel";
import { useTransactions } from "@/hooks/use-transactions";
import { comparisonData, newsItems, portfolioTrend, positions, sectorMix } from "@/lib/chart-data";
import { formatCurrency } from "@/lib/format";
import { portfolioCards, watchlist } from "@/lib/demo-data";

export default function DashboardPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    transactions,
    balance,
    pending,
    isLoading: transactionsLoading,
    isSubmitting: transactionSubmitting,
    error: transactionsError,
    submitRequest,
    refresh,
  } = useTransactions();

  if (!mounted) {
    return null;
  }

  const pieColors = ["#22d3ee", "#38bdf8", "#34d399", "#a78bfa", "#f59e0b", "#94a3b8"];

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-950 px-3 py-4 text-slate-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl sm:mb-8 sm:rounded-[28px] sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo compact />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Portfolio overview</p>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10">
              <Bell className="h-4 w-4" />
              Alerts
            </button>
            <button
              onClick={() => setShowSettings((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => setShowAccountPanel((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
            >
              <Landmark className="h-4 w-4" />
              Accounts
              {pending.count > 0 ? (
                <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950">
                  {pending.count}
                </span>
              ) : null}
            </button>
            <a href="/logout" className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">
              Logout
            </a>
          </div>
        </header>

        {showSettings ? <SettingsPanel onClose={() => setShowSettings(false)} /> : null}

        {showAccountPanel ? (
          <AccountPanel
            balance={balance}
            transactions={transactions}
            isLoading={transactionsLoading}
            isSubmitting={transactionSubmitting}
            error={transactionsError}
            onClose={() => setShowAccountPanel(false)}
            onRefresh={() => void refresh()}
            onSubmit={submitRequest}
          />
        ) : null}

        <section className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {portfolioCards.map((card) => (
            <div key={card.title} className="min-w-0 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-lg shadow-slate-950/30">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span className="truncate">{card.title}</span>
                <div className="shrink-0 rounded-full bg-emerald-500/10 p-2 text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 truncate text-2xl font-bold text-white sm:text-3xl">{card.value}</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
                <ArrowUpRight className="h-4 w-4" />
                {card.change}
              </div>
            </div>
          ))}
        </section>

        <section className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 sm:rounded-[28px] sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Portfolio trend</p>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Account performance</h2>
              </div>
              <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:text-sm">
                <ArrowUpRight className="h-4 w-4 shrink-0" />
                +8.64% this month
              </div>
            </div>

            <div className="h-64 w-full min-w-0 sm:h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={portfolioTrend} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} minTickGap={24} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={48} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: "16px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} fill="url(#portfolioFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 sm:rounded-[28px] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sector mix</p>
                <h2 className="mt-2 text-lg font-bold text-white sm:text-xl">Allocation</h2>
              </div>
              <button className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="h-56 w-full min-w-0 sm:h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={sectorMix} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {sectorMix.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: "16px",
                      color: "#e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {sectorMix.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                    {item.name}
                  </div>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 sm:rounded-[28px] sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Performance</p>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">PVM</h2>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 sm:text-sm">
                <LineChart className="h-4 w-4" />
                YTD
              </div>
            </div>

            <div className="h-60 w-full min-w-0 sm:h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={16} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={48} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: "16px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Bar dataKey="portfolio" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="market" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 sm:rounded-[28px] sm:p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Finance</p>
                <h2 className="mt-2 text-lg font-bold text-white sm:text-xl">Quick stats</h2>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {([
                { label: "Cash available", value: "$42,500", icon: Wallet },
                { label: "Buying power", value: "$61,200", icon: CreditCard },
                { label: "Dividend income", value: "$1,280", icon: DollarSign },
                { label: "Exposure", value: "72%", icon: Briefcase },
              ]).map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-xl bg-cyan-500/10 p-2 text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="truncate text-sm text-slate-300">{label}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 sm:rounded-[28px] sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Watchlist</p>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Top movers</h2>
              </div>
              <button className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10">
                See all
              </button>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
              <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full min-w-[560px] divide-y divide-white/10 text-left text-sm">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Symbol</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Price</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Change</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-900/50 text-sm text-slate-200">
                  {watchlist.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-slate-800/70">
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        <div className="font-semibold text-white">{stock.symbol}</div>
                        <div className="text-xs text-slate-400">{stock.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">${stock.price.toFixed(2)}</td>
                      <td className={`whitespace-nowrap px-3 py-3 font-semibold sm:px-4 ${stock.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-400 sm:px-4">{stock.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 sm:rounded-[28px] sm:p-5">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest news</p>
              <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Market brief</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {newsItems.map((item) => (
                <article key={item.title} className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="truncate">{item.source}</span>
                    <span className="shrink-0">{item.time}</span>
                  </div>
                  <h3 className="text-sm font-medium leading-6 text-slate-100">{item.title}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-300">{item.sentiment}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-300" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 sm:rounded-[28px] sm:p-5">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Holdings</p>
              <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Current positions</h2>
            </div>
            <button className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10">
              Export report
            </button>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[620px] divide-y divide-white/10 text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-4">Symbol</th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-4">Shares</th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-4">Price</th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-4">Value</th>
                  <th className="whitespace-nowrap px-3 py-3 sm:px-4">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-900/50 text-sm text-slate-200">
                {positions.map((position) => (
                  <tr key={position.symbol} className="hover:bg-slate-800/70">
                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-white sm:px-4">{position.symbol}</td>
                    <td className="whitespace-nowrap px-3 py-4 sm:px-4">{position.shares}</td>
                    <td className="whitespace-nowrap px-3 py-4 sm:px-4">${position.price.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-4 sm:px-4">{formatCurrency(position.value)}</td>
                    <td className="whitespace-nowrap px-3 py-4 sm:px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-800 sm:w-24">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${position.weight}%` }} />
                        </div>
                        <span>{position.weight}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}
