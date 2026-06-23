import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** CSV alanını güvenli biçimde kaçışla (virgül/tırnak/yeni satır). */
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const role = url.searchParams.get("role");
  const roleFilter = role === "ADMIN" || role === "USER" ? role : undefined;

  const where: Prisma.UserWhereInput = {
    email: { not: { endsWith: "@galaksimotor.local" } },
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, appointments: true } },
    },
  });

  const header = [
    "Ad",
    "E-posta",
    "Telefon",
    "Rol",
    "Kayıt Tarihi",
    "Sipariş",
    "Randevu",
  ];
  const rows = users
    .filter((u) => !u.email.endsWith("@deleted.local"))
    .map((u) =>
      [
        u.name ?? "",
        u.email,
        u.phone ?? "",
        u.role,
        u.createdAt.toLocaleDateString("tr-TR"),
        u._count.orders,
        u._count.appointments,
      ]
        .map(csvCell)
        .join(",")
    );

  // BOM ekle ki Excel Türkçe karakterleri doğru göstersin
  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="musteriler-${stamp}.csv"`,
    },
  });
}
