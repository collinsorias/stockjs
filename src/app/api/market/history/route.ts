import { NextResponse } from "next/server";

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || "AAPL";
    const interval = searchParams.get("interval") || "5min";
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        error: "ALPHA_VANTAGE_API_KEY is not configured.",
        data: [],
      }, { status: 400 });
    }

    const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_INTRADAY&symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&apikey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      throw new Error(`Alpha Vantage request failed: ${response.status}`);
    }

    const payload = await response.json();
    const timeSeries = payload["Time Series (5min)"] || payload["Time Series (15min)"] || payload["Time Series (30min)"] || payload["Time Series (60min)"] || {};

    const data = Object.entries(timeSeries)
      .slice(0, 24)
      .map(([time, rawValues]) => {
        const values = (rawValues ?? {}) as Record<string, string>;

        return {
          time,
          open: Number(values["1. open"] || 0),
          high: Number(values["2. high"] || 0),
          low: Number(values["3. low"] || 0),
          close: Number(values["4. close"] || 0),
        };
      })
      .reverse();

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("history api error", error);
    return NextResponse.json({ ok: false, error: "Unable to load chart history.", data: [] }, { status: 500 });
  }
}
