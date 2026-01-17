import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  storeId: z.string(),
  text: z.string().min(1).max(200),
});

async function readPayload(req: NextRequest) {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return req.json();
  const fd = await req.formData();
  return {
    storeId: String(fd.get("storeId") ?? ""),
    text: String(fd.get("text") ?? ""),
  };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = Schema.safeParse(await readPayload(req));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { storeId, text } = parsed.data;

  const max = await prisma.task.aggregate({ where: { storeId }, _max: { sortOrder: true } });
  const sortOrder = (max._max.sortOrder ?? 0) + 1;

  await prisma.task.create({
    data: { storeId, text, sortOrder, isActive: true },
  });

  return NextResponse.redirect(new URL("/admin/tasks", req.url));
}
