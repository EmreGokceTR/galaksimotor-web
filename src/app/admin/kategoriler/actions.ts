"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const R = ["/admin/kategoriler", "/urunler", "/"];

export async function upsertCategory(input: {
  id?: string | null;
  name: string;
  slug?: string | null;
  description?: string | null;
  parentId?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Kategori adı zorunlu." };

  const slug = (input.slug?.trim() || toSlug(name)).trim();
  if (!slug) return { ok: false, error: "Geçerli bir slug üretilemedi." };

  // Slug benzersizliği (kendi kaydı hariç)
  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash && clash.id !== input.id) {
    return { ok: false, error: `"${slug}" slug'ı zaten kullanılıyor.` };
  }

  // Kendini parent yapma koruması
  const parentId = input.parentId?.trim() || null;
  if (input.id && parentId === input.id) {
    return { ok: false, error: "Bir kategori kendi üst kategorisi olamaz." };
  }

  try {
    if (input.id) {
      await prisma.category.update({
        where: { id: input.id },
        data: { name, slug, description: input.description?.trim() || null, parentId },
      });
      await logActivity(email, "category_update", `category:${input.id}`, { name, slug });
      for (const p of R) revalidatePath(p);
      return { ok: true, id: input.id };
    }
    const created = await prisma.category.create({
      data: { name, slug, description: input.description?.trim() || null, parentId },
    });
    await logActivity(email, "category_create", `category:${created.id}`, { name, slug });
    for (const p of R) revalidatePath(p);
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Kaydedilemedi." };
  }
}

export async function deleteCategory(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();

  const [productCount, childCount, category] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
    prisma.category.findUnique({ where: { id }, select: { name: true } }),
  ]);

  if (!category) return { ok: false, error: "Kategori bulunamadı." };
  if (productCount > 0) {
    return {
      ok: false,
      error: `Bu kategoride ${productCount} ürün var. Önce ürünleri başka kategoriye taşı veya sil.`,
    };
  }
  if (childCount > 0) {
    return {
      ok: false,
      error: `Bu kategorinin ${childCount} alt kategorisi var. Önce onları taşı veya sil.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  await logActivity(email, "category_delete", `category:${id}`, { name: category.name });
  for (const p of R) revalidatePath(p);
  return { ok: true };
}
