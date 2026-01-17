import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export default async function AdminTasksPage() {
  await requireAdmin();

  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Admin - Tarefas</h1>
      <p className="mt-2 text-sm text-gray-600">Crie e edite as tarefas de cada loja.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map((s) => (
          <StoreTasks key={s.id} storeId={s.id} storeName={s.name} />
        ))}
      </div>
    </main>
  );
}

async function StoreTasks({ storeId, storeName }: { storeId: string; storeName: string }) {
  const tasks = await prisma.task.findMany({ where: { storeId }, orderBy: { sortOrder: "asc" } });

  return (
    <section className="rounded-2xl border p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{storeName}</h2>
      <p className="mt-1 text-sm text-gray-600">
        Total: {tasks.length} (ativos: {tasks.filter((t) => t.isActive).length})
      </p>

      <form action="/admin/tasks/new" method="post" className="mt-4 flex gap-2">
        <input type="hidden" name="storeId" value={storeId} />
        <input
          name="text"
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          placeholder="Nova tarefa"
          required
        />
        <button className="rounded-xl bg-black text-white px-4 py-2 text-sm">Adicionar</button>
      </form>

      <ul className="mt-4 space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
            <div className={t.isActive ? "" : "text-gray-400 line-through"}>{t.text}</div>
            <div className="flex gap-2">
              <form action="/admin/tasks/toggle" method="post">
                <input type="hidden" name="storeId" value={storeId} />
                <input type="hidden" name="taskId" value={t.id} />
                <input type="hidden" name="isActive" value={t.isActive ? "0" : "1"} />
                <button className="rounded-lg border px-2 py-1 text-xs">
                  {t.isActive ? "Desativar" : "Ativar"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <form action="/admin/tasks/create-template" method="post" className="mt-4">
          <input type="hidden" name="storeId" value={storeId} />
          <button className="rounded-xl border px-4 py-2 text-sm">Criar tarefas de exemplo</button>
        </form>
      )}
    </section>
  );
}
