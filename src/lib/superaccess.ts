import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { jwtSecret } from "@/lib/jwt-secret";

export const SUPERACCESS_COOKIE = "superaccess_session";

/**
 * Verify the superaccess session cookie against the shared JWT secret.
 * Returns true only when a valid, unexpired token is present.
 */
export async function verifySuperaccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPERACCESS_COOKIE)?.value;

  if (!token) {
    return false;
  }

  return verifySuperaccessToken(token);
}

/**
 * Verify a raw superaccess token. Used by middleware, which reads the
 * cookie from NextRequest rather than the cookies() store.
 */
export async function verifySuperaccessToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, jwtSecret);
    return true;
  } catch {
    return false;
  }
}
