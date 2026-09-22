import { NextRequest, NextResponse } from "next/server";

import { SUPERACCESS_COOKIE, verifySuperaccessToken } from "@/lib/superaccess";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect /superaccess routes (not the login page)
  if (pathname.startsWith("/superaccess") && !pathname.startsWith("/superaccess/login")) {
    const token = request.cookies.get(SUPERACCESS_COOKIE)?.value;

    if (!token || !(await verifySuperaccessToken(token))) {
      return NextResponse.redirect(new URL("/superaccess/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superaccess/:path*", "/api/superaccess/:path*"],
};
