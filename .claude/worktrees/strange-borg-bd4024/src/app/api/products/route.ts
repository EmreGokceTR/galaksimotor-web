import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const brand = searchParams.get("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock");
  const search = searchParams.get("search");
  const motoId = searchParams.get("motoId");

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (categorySlug) where.category = { slug: categorySlug };
  if (brand) where.brand = brand;
  if (inStock === "true") where.stock = { gt: 0 };
  if (search) where.name = { contains: search };

  if (minPrice || maxPrice) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (minPrice) priceFilter.gte = Number(minPrice);
    if (maxPrice) priceFilter.lte = Number(maxPrice);
    where.price = priceFilter;
  }

  if (motoId) {
    where.fitments = { some: { motorcycleId: motoId } };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
      stock: p.stock,
      brand: p.brand,
      image: p.images[0]?.url ?? null,
      category: { name: p.category.name, slug: p.category.slug },
    })),
  });
}
