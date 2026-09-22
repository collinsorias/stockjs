import { formatCompactVolume, formatPrice } from "@/lib/format";
import { getCachedJson, setCachedJson } from "@/lib/redis";

export type MarketQuote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  previousClose?: number;
};

const YAHOO_FINANCE_BASE = "https://query1.finance.yahoo.com";

type YahooQuote = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  regularMarketPreviousClose?: number;
};

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: YahooQuote[];
  };
};

async function fetchYahooJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchQuoteBatch(symbols: string[]): Promise<MarketQuote[]> {
  if (!symbols.length) {
    return [];
  }

  const cleanSymbols = [...new Set(symbols.filter(Boolean))];
  const cacheKey = `market:quotes:${cleanSymbols.join(",")}`;
  const cached = await getCachedJson<MarketQuote[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const url = `${YAHOO_FINANCE_BASE}/v6/finance/quote?symbols=${encodeURIComponent(cleanSymbols.join(","))}`;
  const payload = await fetchYahooJson<YahooQuoteResponse>(url);

  const result = payload?.quoteResponse?.result ?? [];
  const quotes = result.map((item: YahooQuote) => ({
    symbol: item.symbol ?? "",
    name: item.shortName ?? item.longName ?? item.symbol ?? "",
    price: Number(item.regularMarketPrice ?? 0),
    changePercent: Number(item.regularMarketChangePercent ?? 0),
    volume: Number(item.regularMarketVolume ?? 0),
    previousClose: Number(item.regularMarketPreviousClose ?? 0),
  }));

  await setCachedJson(cacheKey, quotes, 300);

  return quotes;
}

export async function fetchMarketData(symbols: string[]) {
  const quotes = await fetchQuoteBatch(symbols);

  const watchlist = quotes
    .filter((item) => !item.symbol.startsWith("^"))
    .slice(0, 6)
    .map((item) => ({
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.changePercent,
      volume: formatCompactVolume(item.volume),
    }));

  const marketOverview = quotes
    .filter((item) => item.symbol.startsWith("^"))
    .slice(0, 4)
    .map((item) => ({
      label: symbolToLabel(item.symbol),
      value: formatPrice(item.price),
      change: `${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`,
    }));

  return { watchlist, marketOverview };
}

function symbolToLabel(symbol: string) {
  const labels: Record<string, string> = {
    "^GSPC": "S&P 500",
    "^IXIC": "NASDAQ",
    "^DJI": "Dow Jones",
    "^RUT": "Russell 2000",
  };

  return labels[symbol] ?? symbol;
}


