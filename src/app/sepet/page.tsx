import { prisma } from "@/lib/prisma";
import { getShippingConfig } from "@/lib/shipping";
import { EditableWrapper } from "@/components/EditableWrapper";
import {
  CouponAdminPanel,
  type AdminCoupon,
} from "@/components/CouponAdminPanel";
import { CartContent, CartHeader } from "./CartContent";

const R = ["/sepet", "/odeme"];

const fmt = (n: number) =>
  n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default async function CartPage() {
  const [shipping, coupons] = await Promise.all([
    getShippingConfig(),
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const adminCoupons: AdminCoupon[] = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    amount: Number(c.amount),
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
    expiryDate: c.expiryDate ? c.expiryDate.toISOString() : null,
    isActive: c.isActive,
    usageLimit: c.usageLimit,
    timesUsed: c.timesUsed,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <header className="mb-10">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">
          · Sepetim
        </span>
        <CartHeader />
      </header>

      {/* Admin: Kargo ayarları (Edit Mode'da görünür) */}
      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        <EditableWrapper
          table="siteSetting"
          id="shipping_fee"
          field="value"
          value={String(shipping.fee)}
          label="Kargo Ücreti (₺)"
          fieldType="number"
          revalidatePaths={R}
          as="div"
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              Kargo Ücreti
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {shipping.fee === 0 ? "Ücretsiz" : fmt(shipping.fee)}
            </p>
          </div>
        </EditableWrapper>

        <EditableWrapper
          table="siteSetting"
          id="free_shipping_limit"
          field="value"
          value={String(shipping.freeLimit)}
          label="Ücretsiz Kargo Eşiği (₺)"
          fieldType="number"
          revalidatePaths={R}
          as="div"
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              Ücretsiz Kargo Eşiği
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {fmt(shipping.freeLimit)}
            </p>
          </div>
        </EditableWrapper>

        <EditableWrapper
          table="siteSetting"
          id="estimated_delivery_days"
          field="value"
          value={String(shipping.estimatedDays)}
          label="Tahmini Teslim (gün)"
          fieldType="number"
          revalidatePaths={R}
          as="div"
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              Tahmini Teslim
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {shipping.estimatedDays} iş günü
            </p>
          </div>
        </EditableWrapper>
      </section>

      {/* Admin: Kupon yönetim paneli (Edit Mode'da görünür) */}
      <CouponAdminPanel coupons={adminCoupons} />

      <CartContent shipping={shipping} />
    </div>
  );
}
