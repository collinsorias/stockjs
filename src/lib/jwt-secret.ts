const DEV_SECRET = "stockjs-dev-secret-change-me";

/**
 * Shared JWT signing/verification secret.
 *
 * In production a real secret is mandatory: falling back to the well-known
 * development value would let anyone forge session cookies for both regular
 * users and the superaccess admin panel. Failing to boot is the safe outcome.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET is not set. Refusing to start in production with the insecure development default.",
      );
    }

    return new TextEncoder().encode(DEV_SECRET);
  }

  if (process.env.NODE_ENV === "production" && secret === DEV_SECRET) {
    throw new Error(
      "JWT_SECRET is still set to the development default. Set a unique secret before deploying.",
    );
  }

  return new TextEncoder().encode(secret);
}

export const jwtSecret = getJwtSecret();
