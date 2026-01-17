import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: { store: true },
    orderBy: { createdAt: "asc" }
  });

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Admin - Usuarios</h1>

      <div className="mt-6 rounded-2xl border p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Lista</h2>
        <div className="mt-4 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2">
              <div>
                <div className="font-medium">{u.username}</div>
                <div className="text-sm text-gray-600">
                  {u.displayName} • {u.role} • {u.store?.name ?? "(todas)"}
                </div>
              </div>
              <div className="text-sm">{u.isActive ? "Ativo" : "Inativo"}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
