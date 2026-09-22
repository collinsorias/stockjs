import { NextResponse } from "next/server";

import { fetchFinnhubCandles } from "@/lib/finnhub";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get("symbol") || "AAPL").toUpperCase();
    const resolution = searchParams.get("resolution") || "D";
    const count = Number(searchParams.get("count") || "90");
    const candles = await fetchFinnhubCandles(symbol, resolution, count);

    return NextResponse.json({ ok: true, data: candles });
  } catch (error) {
    console.error("finnhub candles error", error);
    return NextResponse.json({ ok: false, error: "Unable to load chart data." }, { status: 500 });
  }
}
