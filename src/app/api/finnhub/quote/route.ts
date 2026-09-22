import { NextResponse } from "next/server";

import { fetchFinnhubQuote } from "@/lib/finnhub";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get("symbol") || "AAPL").toUpperCase();
    const quote = await fetchFinnhubQuote(symbol);

    if (!quote) {
      return NextResponse.json({ ok: false, error: "Quote not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      symbol,
      price: quote.c,
      change: quote.c - quote.pc,
      changePercent: ((quote.c - quote.pc) / quote.pc) * 100,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      previousClose: quote.pc,
      timestamp: quote.t,
    });
  } catch (error) {
    console.error("finnhub quote error", error);
    return NextResponse.json({ ok: false, error: "Unable to load quote." }, { status: 500 });
  }
}
