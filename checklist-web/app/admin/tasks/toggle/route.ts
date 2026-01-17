import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  storeId: z.string(),
  taskId: z.string(),
  isActive: z.union([z.boolean(), z.string()]).transform((v) => {
    if (v === true || v === "true" || v === "1") return true;
    if (v === false || v === "false" || v === "0") return false;
    return Boolean(v);
  }),
});

async function readPayload(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await req.json();
  const form = await req.formData();
  return Object.fromEntries(form.entries());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await readPayload(req);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { storeId, taskId, isActive } = parsed.data;

  const task = await prisma.task.findFirst({ where: { id: taskId, storeId } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await prisma.task.update({ where: { id: task.id }, data: { isActive } });

  return NextResponse.redirect(new URL("/admin/tasks", req.url));
}
