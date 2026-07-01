"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { sendEmail } from "@/lib/mail";
import { priceAlertNotificationTemplate } from "@/lib/email-templates";

function revalidateProduct(id: string, slug?: string) {
  revalidatePath("/admin/urunler");
  revalidatePath(`/admin/urunler/${id}`);
  revalidatePath("/urunler");
  if (slug) revalidatePath(`/urun/${slug}`);
}

// ─── Ürün ana bilgileri ──────────────────────────────────────────────────────

export async function updateProductDetails(formData: FormData) {
  const { email } = await assertAdminContext();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const oemNo = String(formData.get("oemNo") ?? "").trim() || null;
  const compatNo = String(formData.get("compatNo") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10) || 0;
  const isActive = formData.getAll("isActive").includes("1");

  if (!id) throw new Error("Ürün kimliği eksik.");
  if (!name || !slug || !sku || !categoryId || !price) {
    throw new Error("Ad, slug, SKU, kategori ve fiyat zorunlu.");
  }

  // Slug / SKU benzersizliği (kendisi hariç)
  const [slugClash, skuClash, before] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, select: { id: true } }),
    prisma.product.findUnique({ where: { sku }, select: { id: true } }),
    prisma.product.findUnique({ where: { id }, select: { price: true } }),
  ]);
  if (slugClash && slugClash.id !== id) throw new Error(`"${slug}" slug'ı başka üründe kullanılıyor.`);
  if (skuClash && skuClash.id !== id) throw new Error(`"${sku}" SKU'su başka üründe kullanılıyor.`);

  await prisma.product.update({
    where: { id },
    data: { name, slug, sku, description, brand, oemNo, compatNo, categoryId, price, stock, isActive },
  });

  await logActivity(email, "product_update", `product:${id}`, { name, slug });

  const oldPrice = before ? Number(before.price) : null;
  if (oldPrice !== null && price < oldPrice) {
    void notifyPriceDrop(id, slug, name, oldPrice, price);
  }

  revalidateProduct(id, slug);
  redirect(`/admin/urunler/${id}`);
}

/** Fiyat düştüğünde bu ürünü takip eden "İndirime girince haber ver" abonelerine mail atar. */
async function notifyPriceDrop(
  productId: string,
  slug: string,
  name: string,
  oldPrice: number,
  newPrice: number
) {
  const alerts = await prisma.priceAlert.findMany({
    where: { productId, notifiedAt: null },
    select: { id: true, email: true },
  });
  if (alerts.length === 0) return;

  const image = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { position: "asc" },
    select: { url: true },
  });

  const { subject, html } = priceAlertNotificationTemplate({
    productName: name,
    productSlug: slug,
    productImage: image?.url ?? null,
    oldPrice,
    newPrice,
  });

  for (const alert of alerts) {
    void sendEmail({
      to: alert.email,
      subject,
      html,
      category: "price_alert",
      actor: "system",
    });
  }

  await prisma.priceAlert.updateMany({
    where: { id: { in: alerts.map((a) => a.id) } },
    data: { notifiedAt: new Date() },
  });
}

// ─── Görseller ───────────────────────────────────────────────────────────────

export async function addProductImage(formData: FormData) {
  await assertAdminContext();
  const productId = String(formData.get("productId") ?? "");
  const url = String(formData.get("imageUrl") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim() || null;
  if (!productId || !url) throw new Error("Görsel URL'i gerekli.");

  const last = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  await prisma.productImage.create({
    data: { productId, url, alt, position: (last?.position ?? -1) + 1 },
  });

  const p = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  revalidateProduct(productId, p?.slug);
}

export async function deleteProductImage(formData: FormData) {
  await assertAdminContext();
  const imageId = String(formData.get("imageId") ?? "");
  const img = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { productId: true, product: { select: { slug: true } } },
  });
  if (!img) return;
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidateProduct(img.productId, img.product?.slug);
}

// ─── Varyantlar ──────────────────────────────────────────────────────────────

export async function upsertVariant(formData: FormData) {
  await assertAdminContext();
  const id = String(formData.get("variantId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw ? Number(priceRaw) : null;
  const stock = parseInt(String(formData.get("stock") ?? "0"), 10) || 0;

  if (!productId || !name || !value) throw new Error("Varyant adı ve değeri zorunlu.");

  if (id) {
    await prisma.productVariant.update({
      where: { id },
      data: { name, value, sku, price, stock },
    });
  } else {
    await prisma.productVariant.create({
      data: { productId, name, value, sku, price, stock },
    });
  }

  const p = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  revalidateProduct(productId, p?.slug);
}

export async function deleteVariant(formData: FormData) {
  await assertAdminContext();
  const id = String(formData.get("variantId") ?? "");
  const v = await prisma.productVariant.findUnique({
    where: { id },
    select: { productId: true, product: { select: { slug: true } } },
  });
  if (!v) return;
  await prisma.productVariant.delete({ where: { id } });
  revalidateProduct(v.productId, v.product?.slug);
}
