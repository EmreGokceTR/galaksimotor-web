import { requireAdmin } from "@/lib/admin";
import { getSettings, st } from "@/lib/site-settings";
import { TasarimEditor } from "./TasarimEditor";

export default async function TasarimSettingsPage() {
  await requireAdmin();

  const bag = await getSettings(["theme_font", "theme_font_scale"]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Yazı Tipi & Boyut</h1>
        <p className="mt-1 text-sm text-white/50">
          Sitenin tüm sayfalarındaki yazı tipini ve genel metin boyutunu buradan değiştirebilirsin.
          Değişiklikler canlıya anında yansır.
        </p>
      </header>
      <TasarimEditor
        font={st(bag, "theme_font", "inter")}
        scale={st(bag, "theme_font_scale", "100")}
      />
    </div>
  );
}
