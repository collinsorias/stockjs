import type { ReactNode } from "react";

import { requireSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Blocks anonymous visitors and accounts that are disabled or still pending
  // activation, even if they hold a stale session cookie.
  await requireSession();

  return <>{children}</>;
}
