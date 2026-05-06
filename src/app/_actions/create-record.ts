"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

// ─── Türkçe slugifier ────────────────────────────────────────────────────────

function turkishSlug(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `kayit-${Date.now().toString(36)}`;
}

async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = base;
  let i = 1;
  while (await exists(slug)) {
    slug = `${base}-${i++}`;
    if (i > 50) {
      slug = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }
  return slug;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export async function createProductRecord(input: {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
}): Promise<{ id: string; slug: string }> {
  const { email } = await assertAdminContext();
  const name = input.name.trim();
  if (!name) throw new Error("Ürün adı zorunlu.");
  if (!input.categoryId) throw new Error("Kategori seçimi zorunlu.");
  if (!input.price || isNaN(input.price) || input.price <= 0)
    throw new Error("Geçerli bir fiyat girin.");

  const slug = await uniqueSlug(turkishSlug(name), async (s) =>
    Boolean(await prisma.product.findUnique({ where: { slug: s } }))
  );
  const sku = `SKU-${Date.now().toString(36).toUpperCase()}`;

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      sku,
      description: input.description?.trim() || null,
      price: input.price,
      stock: 0,
      categoryId: input.categoryId,
      ...(input.imageUrl?.trim()
        ? {
            images: {
              create: {
                url: input.imageUrl.trim(),
                alt: name,
                position: 0,
              },
            },
          }
        : {}),
    },
  });

  await logActivity(email, "create", `product:${product.id}`, {
    name,
    price: input.price,
  });

  revalidatePath("/urunler");
  revalidatePath("/admin/urunler");
  revalidatePath("/");
  return { id: product.id, slug: product.slug };
}

// ─── MotorcycleListing ───────────────────────────────────────────────────────

export async function createMotorcycleListingRecord(input: {
  marka: string;
  model: string;
  yil: number;
  fiyat: number;
  cc?: number;
  gorsel?: string;
  aciklama?: string;
}): Promise<{ id: string }> {
  const { email } = await assertAdminContext();
  const marka = input.marka.trim();
  const model = input.model.trim();
  if (!marka || !model) throw new Error("Marka ve model zorunlu.");
  if (!input.yil || isNaN(input.yil)) throw new Error("Yıl zorunlu.");
  if (!input.fiyat || isNaN(input.fiyat) || input.fiyat <= 0)
    throw new Error("Geçerli bir fiyat girin.");

  const listing = await prisma.motorcycleListing.create({
    data: {
      marka,
      model,
      yil: input.yil,
      cc: input.cc && !isNaN(input.cc) ? input.cc : null,
      fiyat: input.fiyat,
      gorsel: input.gorsel?.trim() || null,
      aciklama: input.aciklama?.trim() || null,
    },
  });

  await logActivity(email, "create", `motorcycleListing:${listing.id}`, {
    marka,
    model,
    yil: input.yil,
  });

  revalidatePath("/motosikletler");
  return { id: listing.id };
}

// ─── BlogPost ────────────────────────────────────────────────────────────────

export async function createBlogPostRecord(input: {
  title: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
}): Promise<{ id: string; slug: string }> {
  const { email } = await assertAdminContext();
  const title = input.title.trim();
  if (!title) throw new Error("Başlık zorunlu.");

  const slug = await uniqueSlug(turkishSlug(title), async (s) =>
    Boolean(await prisma.blogPost.findUnique({ where: { slug: s } }))
  );

  const content = input.content?.trim() || `<p>${title}</p>`;

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: input.excerpt?.trim() || null,
      content,
      coverUrl: input.coverUrl?.trim() || null,
      isPublished: false,
    },
  });

  await logActivity(email, "create", `blogPost:${post.id}`, { title });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { id: post.id, slug: post.slug };
}
