import { prisma } from "@/lib/prisma";

/**
 * Site-wide settings editable from the superaccess panel.
 *
 * Values live in the AppSetting key/value table so they can be changed at
 * runtime without a redeploy. Every read falls back to a hardcoded default,
 * so a fresh database (or a missing row) still renders a usable address.
 */

export const DEPOSIT_ADDRESS_KEY = "bitcoin_deposit_address";

/**
 * Fallback address, used until an admin saves a replacement. This is the
 * address the dashboard shipped with, so existing behaviour is unchanged on a
 * database that has never had the setting written.
 */
export const DEFAULT_DEPOSIT_ADDRESS = "bc1q2kgkxkkhjeammrux3al9zs5mz292w8c6feczre";

/**
 * A Bitcoin address has no single strict global format: mainnet uses Base58
 * (P2PKH "1…", P2SH "3…") and Bech32/Bech32m ("bc1…"), while testnet uses
 * "m"/"n"/"2"/"tb1". Rather than pretend to fully validate, accept any
 * reasonable token and catch the real-world mistake - a wrong-chain or
 * mistyped address - through a conservative character/length check.
 */
const BASE58_BODY = /^[1-9A-HJ-NP-Za-km-z]+$/;
const BECH32_BODY = /^[02-9ac-hj-np-z]+$/;

/**
 * Lengths of the Bech32 data part (everything after the "1" separator),
 * which is: witness version + encoded program + 6-character checksum.
 *
 * A v0 P2WPKH/P2WSH address is 39 characters (1 + 32 + 6); a v1 Taproot
 * address is 59 (1 + 58 + 6). These are exact, so a truncated or padded
 * variant of a real address is rejected rather than saved as a broken
 * deposit target - a mistake that would only surface once funds were sent.
 */
const BECH32_V0_DATA_LENGTH = 39;
const BECH32_V1_DATA_LENGTH = 59;

/**
 * Witness version as encoded in Bech32: the version number is written as a
 * single character from the charset, so version 0 is "q" and version 1 is
 * "p" - NOT the characters "0" and "1".
 */
const BECH32_WITNESS_VERSION_0 = "q";
const BECH32_WITNESS_VERSION_1 = "p";

export function isValidBitcoinAddress(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const address = value.trim();

  // Base58 mainnet/testnet P2PKH and P2SH.
  if (/^[13mn2][1-9A-HJ-NP-Za-km-z]{25,39}$/.test(address)) {
    return BASE58_BODY.test(address.slice(1));
  }

  // Bech32 (mainnet "bc", testnet "tb" human-readable part). Reject a mixed
  // case address: Bech32 requires the whole string to be one case.
  const lowered = address.toLowerCase();
  const isSingleCase = address === lowered || address === address.toUpperCase();

  if (!isSingleCase) {
    return false;
  }

  const separatorIndex = lowered.lastIndexOf("1");

  if (separatorIndex !== 2) {
    return false;
  }

  const hrp = lowered.slice(0, 2);

  if (hrp !== "bc" && hrp !== "tb") {
    return false;
  }

  const data = lowered.slice(separatorIndex + 1);

  if (!BECH32_BODY.test(data)) {
    return false;
  }

  const witnessVersion = data.charAt(0);

  if (witnessVersion === BECH32_WITNESS_VERSION_0) {
    return data.length === BECH32_V0_DATA_LENGTH;
  }

  if (witnessVersion === BECH32_WITNESS_VERSION_1) {
    return data.length === BECH32_V1_DATA_LENGTH;
  }

  return false;
}

/** Read a setting, returning the fallback when the row is absent or blank. */
export async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });

    return row?.value?.trim() || fallback;
  } catch (err) {
    // A read that fails (missing table before migration, transient database
    // error) must not take the dashboard down: serve the default instead.
    console.error("Failed to read setting", key, err);
    return fallback;
  }
}

/** Upsert a setting. Throws on failure so callers can report it. */
export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

/** The Bitcoin deposit address shown to users on the dashboard. */
export function getDepositAddress(): Promise<string> {
  return getSetting(DEPOSIT_ADDRESS_KEY, DEFAULT_DEPOSIT_ADDRESS);
}