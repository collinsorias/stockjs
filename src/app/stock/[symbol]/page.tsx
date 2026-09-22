"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatPercentChange, formatPrice } from "@/lib/format";

type StockQuote = {
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
};

type StockCandle = {
  date: string;
  close: number;
};

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [candles, setCandles] = useState<StockCandle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const resolved = await params;
      const resolvedSymbol = decodeURIComponent(resolved.symbol).toUpperCase();
      setSymbol(resolvedSymbol);

      const [quoteRes, candlesRes] = await Promise.all([
        fetch(`/api/finnhub/quote?symbol=${resolvedSymbol}`),
        fetch(`/api/finnhub/candles?symbol=${resolvedSymbol}&resolution=D&count=90`),
      ]);

      const quoteData = await quoteRes.json();
      const candleData = await candlesRes.json();

      setQuote(quoteData);
      setCandles(candleData.data || []);
      setLoading(false);
    }

    load();
  }, [params]);

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-10 text-slate-100">Loading stock data...</main>;
  }

  const price = quote?.price ?? 0;
  const change = quote?.change ?? 0;
  const changePercent = quote?.changePercent ?? 0;

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-slate-900 p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Stock detail</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{symbol}</h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            {price > 0 ? `$${formatPrice(price)}` : "--"}
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Current price</div>
            <div className="mt-2 text-2xl font-bold text-white">${formatPrice(price)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Change</div>
            <div className={`mt-2 text-2xl font-bold ${change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {change >= 0 ? "+" : ""}${change.toFixed(2)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Percent</div>
            <div className={`mt-2 text-2xl font-bold ${changePercent >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {formatPercentChange(changePercent)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
            <div className="text-sm text-slate-400">Previous close</div>
            <div className="mt-2 text-2xl font-bold text-white">${formatPrice(quote?.previousClose ?? 0)}</div>
          </div>
        </div>

        <div className="h-[420px] w-full rounded-2xl border border-white/10 bg-slate-950 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={candles}>
              <defs>
                <linearGradient id="stockArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "16px",
                  color: "#e2e8f0",
                }}
              />
              <Area type="monotone" dataKey="close" stroke="#22d3ee" strokeWidth={3} fill="url(#stockArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
