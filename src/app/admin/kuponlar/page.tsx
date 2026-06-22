import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { CouponManager } from "./CouponManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kuponlar · Admin" };

export default async function AdminCouponsPage() {
  await requireAdmin();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Decimal alanları client'a düz sayı olarak geçir
  const data = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    amount: Number(c.amount),
    minOrderAmount: c.minOrderAmount === null ? null : Number(c.minOrderAmount),
    expiryDate: c.expiryDate ? c.expiryDate.toISOString() : null,
    isActive: c.isActive,
    usageLimit: c.usageLimit,
    timesUsed: c.timesUsed,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">İndirim Kuponları</h1>
        <p className="mt-1 text-sm text-white/50">
          Sepette geçerli indirim kuponları oluştur, aktif/pasif yap veya sil.
          Yüzde (%) ya da sabit (₺) indirim, minimum sepet tutarı, son kullanma
          tarihi ve kullanım limiti tanımlayabilirsin.
        </p>
      </header>

      <CouponManager coupons={data} />
    </div>
  );
}
