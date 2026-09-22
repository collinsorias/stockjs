import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { jwtSecret } from "@/lib/jwt-secret";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

export function normalizeRole(role: string | null | undefined): "USER" | "ADMIN" {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, jwtSecret);

  return {
    id: String(payload.id),
    email: String(payload.email),
    name: String(payload.name),
    role: normalizeRole(String(payload.role)),
  } satisfies SessionUser;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("stockjs_session")?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  // A session cookie alone is not enough: accounts that were disabled (or are
  // still awaiting activation) must lose access immediately.
  if (!user || !user.isActive) {
    redirect("/login?reason=inactive");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: normalizeRole(user.role),
  } satisfies SessionUser;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function requireAdmin() {
  const session = await requireSession();

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const user = await getUserById(session.id);

  if (!user) {
    redirect("/login");
  }

  return user;
}
