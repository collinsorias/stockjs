import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { marketOverview, portfolioCards, watchlist } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_30%),linear-gradient(180deg,#020817_0%,#0f172a_100%)] text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <BrandLogo compact={false} />
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#markets" className="transition hover:text-white">Markets</a>
            <a href="#portfolio" className="transition hover:text-white">Portfolio</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#news" className="transition hover:text-white">News</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Sign up
            </Link>
          </div>
        </header>

        <section className="grid gap-8 pb-12 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Live investing platform
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              10x smarter with real-time market intelligence.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              Monitor stocks, build long-term wealth, and keep every portfolio decision backed by live data and elegant analysis.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Create account
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg gap-4 sm:grid-cols-3">
              <div>
                <div className="text-2xl font-bold text-white">$24.6B</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Volume</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">128K</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Active users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Market data</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Portfolio value</p>
                <h2 className="mt-1 text-3xl font-bold">$184,260</h2>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                +$6,420</div>
            </div>

            <div className="space-y-4">
              {portfolioCards.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{item.title}</span>
                    <span className="text-emerald-300">{item.change}</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="markets" className="mt-6 grid gap-6 md:grid-cols-4">
          {marketOverview.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-400">{item.label}</div>
              <div className="mt-3 text-2xl font-bold text-white">{item.value}</div>
              <div className="mt-1 text-sm font-medium text-emerald-300">{item.change}</div>
            </div>
          ))}
        </section>

        <section id="portfolio" className="mt-12 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Watchlist</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Top movers</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              Update every 15 min
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-900/60 text-sm text-slate-200">
                {watchlist.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-slate-800/60">
                    <td className="px-4 py-3 font-semibold text-white">{stock.symbol}</td>
                    <td className="px-4 py-3">{stock.name}</td>
                    <td className="px-4 py-3">${stock.price.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-semibold ${stock.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-slate-400">{stock.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
