import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/site-settings";
import { FAQS } from "@/config/faq";
import { SssEditor } from "./SssEditor";
import type { FaqItem } from "./actions";

export default async function SssSettingsPage() {
  await requireAdmin();

  const bag = await getSettings(["sss_items"]);
  let items: FaqItem[] = FAQS;
  if (bag.sss_items) {
    try { items = JSON.parse(bag.sss_items); } catch {}
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">SSS İçeriği</h1>
        <p className="mt-1 text-sm text-white/50">
          Sıkça Sorulan Sorular sayfasındaki soru ve cevapları buradan düzenleyebilirsiniz.
          Değişiklikler anında siteye yansır.
        </p>
      </header>
      <SssEditor initialItems={items} />
    </div>
  );
}
