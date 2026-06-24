import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/site-settings";
import { SECTIONS, ALL_TEXT_KEYS } from "./fields";
import { SiteTextsEditor } from "./SiteTextsEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site Metinleri · Admin" };

export default async function SiteTextsPage() {
  await requireAdmin();
  const bag = await getSettings(ALL_TEXT_KEYS);

  // Etkin değer: kayıtlı değer varsa o, yoksa boş (placeholder varsayılanı gösterir)
  const values: Record<string, string> = {};
  for (const key of ALL_TEXT_KEYS) values[key] = bag[key] ?? "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Site Metinleri</h1>
        <p className="mt-1 text-sm text-white/50">
          Anasayfa, menü, footer, WhatsApp ve diğer sayfalardaki tüm metin ve
          görseller. Bir alanı boş bırakırsanız sitedeki varsayılan metin
          (gri ipucu) görünmeye devam eder. Değişiklikler kaydedince anında
          yayına girer.
        </p>
      </header>
      <SiteTextsEditor sections={SECTIONS} values={values} />
    </div>
  );
}
