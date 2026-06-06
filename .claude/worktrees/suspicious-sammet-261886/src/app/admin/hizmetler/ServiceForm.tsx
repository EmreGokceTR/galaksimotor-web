import { upsertService } from "./actions";

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration: number;
  price: number | null;
  isActive: boolean;
};

export function ServiceForm({ service }: { service?: Service }) {
  return (
    <form action={upsertService} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      {service && <input type="hidden" name="id" value={service.id} />}

      <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
        {service ? "Hizmeti Düzenle" : "Yeni Hizmet"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">İsim *</span>
          <input type="text" name="name" required defaultValue={service?.name ?? ""}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Slug (boş = otomatik)</span>
          <input type="text" name="slug" defaultValue={service?.slug ?? ""}
            placeholder="periyodik-bakim"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Açıklama</span>
        <textarea name="description" rows={3} defaultValue={service?.description ?? ""}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Süre (dakika)</span>
          <input type="number" name="duration" min={5} step={5} defaultValue={service?.duration ?? 60}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">Fiyat ₺ (boş = ücretsiz)</span>
          <input type="number" name="price" min={0} step={0.01} defaultValue={service?.price ?? ""}
            placeholder="0.00"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25" />
        </label>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input type="hidden" name="isActive" value="0" />
        <input type="checkbox" name="isActive" value="1"
          defaultChecked={service?.isActive ?? true}
          className="h-4 w-4 rounded border-white/20 accent-brand-yellow" />
        <span className="text-sm text-white/70">Aktif (randevu formunda görünsün)</span>
      </label>

      <div className="flex justify-end pt-1">
        <button type="submit"
          className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80">
          {service ? "Güncelle" : "Ekle"}
        </button>
      </div>
    </form>
  );
}
