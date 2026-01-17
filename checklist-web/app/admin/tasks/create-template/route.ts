import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({ storeId: z.string() });

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

  const parsed = Schema.safeParse(await readPayload(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { storeId } = parsed.data;

  const existing = await prisma.task.count({ where: { storeId } });
  if (existing > 0) return NextResponse.json({ ok: true, message: "Tasks already exist" });

  const sample = [
    "Abrir caixa e organizar balcao",
    "Conferir limpeza do piso",
    "Repor embalagens",
    "Checar estoque minimo",
  ];

  await prisma.task.createMany({
    data: sample.map((text, idx) => ({ storeId, text, sortOrder: idx + 1, isActive: true })),
  });

  return NextResponse.json({ ok: true });
}
