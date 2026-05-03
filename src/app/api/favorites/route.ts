import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/favorites — current user's favorite product IDs */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ids: [] });
  }
  const favs = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return NextResponse.json({ ids: favs.map((f) => f.productId) });
}

/** POST /api/favorites { productId } — toggle favorite, returns { favorited: boolean } */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Önce giriş yapmalısın." },
      { status: 401 }
    );
  }

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (!body.productId) {
    return NextResponse.json({ error: "productId zorunlu." }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: body.productId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: { userId: session.user.id, productId: body.productId },
  });
  return NextResponse.json({ favorited: true });
}
