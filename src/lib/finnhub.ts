export type FinnhubQuote = {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

export type FinnhubProfile = {
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  marketCapitalization: number;
  shareOutstanding: number;
};

export type FinnhubCandles = {
  t: number[];
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  v: number[];
};

const BASE_URL = "https://finnhub.io/api/v1";

function getApiKey() {
  return process.env.FINNHUB_API_KEY || "";
}

async function fetchFinnhub<T>(path: string, params: Record<string, string> = {}) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY is not configured.");
  }

  const query = new URLSearchParams({
    ...params,
    token: apiKey,
  });

  const response = await fetch(`${BASE_URL}${path}?${query.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Finnhub request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  try {
    const quote = await fetchFinnhub<FinnhubQuote>(`/quote`, { symbol });
    return quote?.c ? quote : null;
  } catch {
    return null;
  }
}

export async function fetchFinnhubProfile(symbol: string): Promise<FinnhubProfile | null> {
  try {
    const profile = await fetchFinnhub<FinnhubProfile | null>(`/stock/profile2`, { symbol });

    if (!profile || !profile.ticker) {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

export async function fetchFinnhubCandles(symbol: string, resolution = "D", count = 90) {
  try {
    const candles = await fetchFinnhub<FinnhubCandles>(`/stock/candle`, {
      symbol,
      resolution,
      from: String(Math.floor(Date.now() / 1000) - count * 86400),
      to: String(Math.floor(Date.now() / 1000)),
    });

    if (!candles || candles.s !== "ok") {
      return [];
    }

    return candles.t.map((time, index) => ({
      date: new Date(time * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      open: candles.o[index],
      high: candles.h[index],
      low: candles.l[index],
      close: candles.c[index],
      volume: candles.v[index],
    }));
  } catch {
    return [];
  }
}
