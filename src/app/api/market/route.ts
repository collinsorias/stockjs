import { NextResponse } from "next/server";

import { fetchMarketData } from "@/lib/market-api";

export async function GET() {
  try {
    const symbols = ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "META", "^GSPC", "^IXIC", "^DJI", "^RUT"];
    const data = await fetchMarketData(symbols);

    return NextResponse.json({
      ok: true,
      marketOverview: data.marketOverview,
      watchlist: data.watchlist,
    });
  } catch (error) {
    console.error("market api error", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load market data right now.",
        marketOverview: [],
        watchlist: [],
      },
      { status: 500 }
    );
  }
}
