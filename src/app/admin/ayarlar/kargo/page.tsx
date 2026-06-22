import { requireAdmin } from "@/lib/admin";
import { getShippingConfig } from "@/lib/shipping";
import { ShippingEditor } from "./ShippingEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kargo Ayarları · Admin" };

export default async function ShippingSettingsPage() {
  await requireAdmin();
  const cfg = await getShippingConfig();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Kargo & Teslimat</h1>
        <p className="mt-1 text-sm text-white/50">
          Kargo ücreti, ücretsiz kargo eşiği ve tahmini teslim süresi. Bu
          değerler sepet, ödeme ve ürün sayfalarında anında geçerli olur.
        </p>
      </header>
      <ShippingEditor
        fee={cfg.fee}
        freeLimit={cfg.freeLimit}
        estimatedDays={cfg.estimatedDays}
      />
    </div>
  );
}
