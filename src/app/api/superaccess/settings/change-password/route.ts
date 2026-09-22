import { NextResponse } from "next/server";

import { verifySuperaccess } from "@/lib/superaccess";
import {
  getSuperaccessPassword,
  verifySuperaccessCredentials,
  getSuperaccessUsername,
} from "@/lib/superaccess-credentials";

export async function POST(request: Request) {
  const isAuthorized = await verifySuperaccess();

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body ?? {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate against the configured credential rather than a mutable module
    // variable, so this check reflects the password that login will accept.
    if (
      !verifySuperaccessCredentials(getSuperaccessUsername(), currentPassword)
    ) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // The admin password is supplied by the SUPERACCESS_PASSWORD environment
    // variable. It cannot be written back to the running process, so instead of
    // silently discarding the change we refuse it and tell the operator exactly
    // how to apply it. This keeps the UI from reporting a success that did not
    // happen - the previous implementation stored the value in memory, where it
    // was lost on restart and never actually used by the login route.
    const configured = getSuperaccessPassword();

    if (!configured) {
      return NextResponse.json(
        { error: "Superaccess password is not configured on the server." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error:
          "The admin password is managed by the SUPERACCESS_PASSWORD environment variable and cannot be changed from this page. Update the variable and restart the server.",
      },
      { status: 501 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
