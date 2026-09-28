import { NextResponse } from "next/server";

import {
  getDepositAddress,
  isValidBitcoinAddress,
  setSetting,
  DEPOSIT_ADDRESS_KEY,
} from "@/lib/app-settings";
import { verifySuperaccess } from "@/lib/superaccess";

/**
 * The Bitcoin deposit address shown on the user dashboard.
 *
 * GET is unauthenticated on purpose: the signed-in dashboard needs the address
 * to render, and it is already displayed to every user, so it is not secret.
 * Writing is admin-only and goes through verifySuperaccess below.
 */
export async function GET() {
  try {
    const address = await getDepositAddress();

    return NextResponse.json({ address });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load deposit address" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { address } = body ?? {};

    if (typeof address !== "string" || address.trim().length === 0) {
      return NextResponse.json({ error: "Deposit address is required" }, { status: 400 });
    }

    const trimmed = address.trim();

    if (!isValidBitcoinAddress(trimmed)) {
      return NextResponse.json(
        { error: "That does not look like a valid Bitcoin address" },
        { status: 400 },
      );
    }

    await setSetting(DEPOSIT_ADDRESS_KEY, trimmed);

    return NextResponse.json({ address: trimmed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update deposit address" }, { status: 500 });
  }
}