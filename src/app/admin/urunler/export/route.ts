import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } },
  });

  const header = [
    "Ürün Adı",
    "SKU",
    "Slug",
    "Kategori",
    "Marka",
    "Fiyat",
    "Stok",
    "Durum",
  ];

  const rows = products.map((p) =>
    [
      p.name,
      p.sku,
      p.slug,
      p.category?.name ?? "",
      p.brand ?? "",
      Number(p.price).toFixed(2),
      p.stock,
      p.isActive ? "Aktif" : "Pasif",
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="urunler-${stamp}.csv"`,
    },
  });
}
