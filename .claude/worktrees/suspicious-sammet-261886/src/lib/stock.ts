import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";
import { sendLowStockAlert } from "@/lib/notifications";

const DEFAULT_THRESHOLD = 5;

/** siteSetting'dan low_stock_threshold (default 5). */
export async function getLowStockThreshold(): Promise<number> {
  const bag = await getSettings(["low_stock_threshold"]);
  const raw = bag.low_stock_threshold;
  const n = raw ? Number(raw) : DEFAULT_THRESHOLD;
  return isNaN(n) || n < 0 ? DEFAULT_THRESHOLD : n;
}

/** Stok düşümünden sonra eşiği geçen ürünler için admin'e mail. */
export async function notifyLowStockIfCrossed(
  productIds: string[]
): Promise<void> {
  if (productIds.length === 0) return;
  const threshold = await getLowStockThreshold();
  const items = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true, stock: { lte: threshold } },
    select: { id: true, name: true, slug: true, stock: true },
  });
  for (const p of items) {
    sendLowStockAlert({
      productName: p.name,
      productSlug: p.slug,
      stock: p.stock,
      threshold,
    }).catch(console.error);
  }
}
