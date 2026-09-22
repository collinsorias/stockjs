import { NextResponse } from "next/server";

import { fetchQuoteBatch } from "@/lib/market-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const data = await fetchQuoteBatch([decodeURIComponent(symbol)]);

    if (!data.length) {
      return NextResponse.json({ ok: false, error: "Symbol not found." }, { status: 404 });
    }

    const quote = data[0];

    return NextResponse.json({
      ok: true,
      quote: {
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        changePercent: quote.changePercent,
        volume: quote.volume,
        previousClose: quote.previousClose,
      },
    });
  } catch (error) {
    console.error("symbol api error", error);
    return NextResponse.json({ ok: false, error: "Unable to load symbol data." }, { status: 500 });
  }
}
