import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/garage — list user's saved motorcycles */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ items: [] });

  const items = await prisma.userMotorcycle.findMany({
    where: { userId: session.user.id },
    include: { motorcycle: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({
    items: items.map((it) => ({
      id: it.id,
      motorcycleId: it.motorcycleId,
      nickname: it.nickname,
      brand: it.motorcycle.brand,
      model: it.motorcycle.model,
      year: it.motorcycle.year,
    })),
  });
}

/** POST /api/garage { brand, model, year, nickname? } — add motorcycle */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Önce giriş yap." }, { status: 401 });
  }

  let body: { brand?: string; model?: string; year?: number; nickname?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const brand = body.brand?.trim();
  const model = body.model?.trim();
  const year = Number(body.year);
  if (!brand || !model || !year || year < 1980 || year > new Date().getFullYear() + 1) {
    return NextResponse.json(
      { error: "Marka, model ve geçerli yıl zorunlu." },
      { status: 400 }
    );
  }

  // Find or create motorcycle
  const moto = await prisma.motorcycle.upsert({
    where: { brand_model_year: { brand, model, year } },
    update: {},
    create: { brand, model, year },
  });

  // Link to user (avoid duplicate)
  const existing = await prisma.userMotorcycle.findUnique({
    where: {
      userId_motorcycleId: {
        userId: session.user.id,
        motorcycleId: moto.id,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id });
  }

  const link = await prisma.userMotorcycle.create({
    data: {
      userId: session.user.id,
      motorcycleId: moto.id,
      nickname: body.nickname?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, id: link.id }, { status: 201 });
}
