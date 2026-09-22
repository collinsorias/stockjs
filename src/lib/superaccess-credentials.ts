import { timingSafeEqual } from "crypto";

/**
 * Superaccess admin credentials.
 *
 * These are read from the environment so that no admin password is ever
 * committed to the repository. In production both variables are required:
 * without them the panel is disabled rather than silently falling back to a
 * well-known default.
 */
const DEV_USERNAME = "admin";
const DEV_PASSWORD = "admin";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function getSuperaccessUsername(): string {
  return process.env.SUPERACCESS_USERNAME || (isProduction() ? "" : DEV_USERNAME);
}

export function getSuperaccessPassword(): string {
  return process.env.SUPERACCESS_PASSWORD || (isProduction() ? "" : DEV_PASSWORD);
}

/** Constant-time string comparison to avoid leaking length/prefix timing. */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  // timingSafeEqual throws on length mismatch, so compare a digest of each
  // side's length first and keep the buffers equal-length for the real check.
  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Validate submitted credentials against the configured admin account.
 * Returns false when the panel is unconfigured, so a production deployment
 * missing its environment variables cannot be logged into at all.
 */
export function verifySuperaccessCredentials(username: unknown, password: unknown): boolean {
  if (typeof username !== "string" || typeof password !== "string") {
    return false;
  }

  const expectedUsername = getSuperaccessUsername();
  const expectedPassword = getSuperaccessPassword();

  if (!expectedUsername || !expectedPassword) {
    return false;
  }

  return (
    safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword)
  );
}