import { NextResponse } from "next/server";

import { fetchFinnhubProfile } from "@/lib/finnhub";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get("symbol") || "AAPL").toUpperCase();
    const profile = await fetchFinnhubProfile(symbol);

    if (!profile) {
      return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      symbol,
      name: profile.name,
      exchange: profile.exchange,
      currency: profile.currency,
      marketCap: profile.marketCapitalization,
      sharesOutstanding: profile.shareOutstanding,
    });
  } catch (error) {
    console.error("finnhub profile error", error);
    return NextResponse.json({ ok: false, error: "Unable to load profile." }, { status: 500 });
  }
}
