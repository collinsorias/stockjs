import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  location: string | null;
  investmentGoal: string | null;
  createdAt: Date;
};

async function getUsers(): Promise<AdminUserSummary[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      location: true,
      investmentGoal: true,
      createdAt: true,
    },
  }) as Promise<AdminUserSummary[]>;
}

async function toggleUser(formData: FormData) {
  "use server";

  const userId = String(formData.get("userId") || "");
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    redirect("/admin");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin");
}

async function changeUserRole(formData: FormData) {
  "use server";

  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "USER");

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    redirect("/admin");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role === "ADMIN" ? "ADMIN" : "USER" },
  });

  revalidatePath("/admin");
}

async function updateUserProfile(formData: FormData) {
  "use server";

  const userId = String(formData.get("userId") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const investmentGoal = String(formData.get("investmentGoal") || "").trim();

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    redirect("/admin");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || user.name,
      email: email || user.email,
      location: location || null,
      investmentGoal: investmentGoal || null,
    },
  });

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const admin = await requireAdmin();
  const users: AdminUserSummary[] = await getUsers();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Admin controls</p>
            <h1 className="mt-2 text-3xl font-bold">User management</h1>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">
              Dashboard
            </a>
            <a href="/logout" className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
              Logout
            </a>
          </div>
        </header>

        <section className="mb-6 rounded-3xl border border-white/10 bg-slate-900 p-6">
          <div className="text-sm text-slate-400">Signed in as</div>
          <div className="mt-2 text-xl font-bold text-white">{admin.name}</div>
          <div className="text-sm text-slate-300">{admin.email}</div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Goal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                {users.map((user: AdminUserSummary) => (
                  <tr key={user.id} className="bg-slate-900/70 align-top">
                    <td className="px-4 py-4 font-medium text-white">
                      <div className="text-white">{user.name}</div>
                    </td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">
                      <form action={changeUserRole} className="space-y-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <select name="role" defaultValue={user.role} className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white outline-none">
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button type="submit" className="block rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10">
                          Update role
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-4">{user.location ?? "—"}</td>
                    <td className="px-4 py-4">{user.investmentGoal ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className={user.isActive ? "text-emerald-300" : "text-rose-300"}>{user.isActive ? "Active" : "Disabled"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-3">
                        <form action={updateUserProfile} className="space-y-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <input name="name" defaultValue={user.name} className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white outline-none" />
                          <input name="email" defaultValue={user.email} className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white outline-none" />
                          <input name="location" defaultValue={user.location ?? ""} placeholder="Location" className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500" />
                          <input name="investmentGoal" defaultValue={user.investmentGoal ?? ""} placeholder="Investment goal" className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500" />
                          <button type="submit" className="w-full rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400">
                            Save profile
                          </button>
                        </form>

                        <form action={toggleUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold ${user.isActive ? "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30" : "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"}`}>
                            {user.isActive ? "Disable" : "Enable"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
