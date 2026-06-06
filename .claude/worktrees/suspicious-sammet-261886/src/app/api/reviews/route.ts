import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/reviews?productId= — list reviews for a product */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ reviews: [], summary: { count: 0, avg: 0 } });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, image: true } } },
    take: 50,
  });

  const count = reviews.length;
  const avg =
    count === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / count;

  return NextResponse.json({
    summary: { count, avg: Number(avg.toFixed(2)) },
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      author: r.user.name ?? r.user.email.split("@")[0],
      authorImage: r.user.image,
    })),
  });
}

/** POST /api/reviews { productId, rating, comment } — create or update own review */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Yorum yapmak için giriş yapmalısın." },
      { status: 401 }
    );
  }

  let body: { productId?: string; rating?: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!body.productId || !body.rating) {
    return NextResponse.json(
      { error: "Ürün ve puan zorunlu." },
      { status: 400 }
    );
  }
  if (body.rating < 1 || body.rating > 5) {
    return NextResponse.json(
      { error: "Puan 1-5 arası olmalı." },
      { status: 400 }
    );
  }

  // tek kullanıcı tek yorum: varsa update et
  const existing = await prisma.review.findFirst({
    where: { userId: session.user.id, productId: body.productId },
  });

  const review = existing
    ? await prisma.review.update({
        where: { id: existing.id },
        data: { rating: body.rating, comment: body.comment?.trim() || null },
      })
    : await prisma.review.create({
        data: {
          userId: session.user.id,
          productId: body.productId,
          rating: body.rating,
          comment: body.comment?.trim() || null,
        },
      });

  return NextResponse.json({ id: review.id }, { status: 201 });
}
