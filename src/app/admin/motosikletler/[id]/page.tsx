import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMotorcycleListing } from "../actions";
import { MultiImageUploader } from "@/components/MultiImageUploader";

export const dynamic = "force-dynamic";
export const metadata = { title: "İlanı Düzenle - Admin" };

export default async function EditMotorcycleListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await prisma.motorcycleListing.findUnique({ where: { id: params.id } });
  if (!listing) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          İlanı Düzenle — {listing.marka} {listing.model}
        </h1>
        <Link
          href="/admin/motosikletler"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
        >
          ← Geri
        </Link>
      </div>

      <form
        action={updateMotorcycleListing}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6"
      >
        <input type="hidden" name="id" value={listing.id} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Marka *</span>
            <input name="marka" required defaultValue={listing.marka} className="input-glass w-full mt-1" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Model *</span>
            <input name="model" required defaultValue={listing.model} className="input-glass w-full mt-1" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Yıl *</span>
            <input name="yil" type="number" required min={1900} max={2100} defaultValue={listing.yil} className="input-glass w-full mt-1" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">CC</span>
            <input name="cc" type="number" min={0} defaultValue={listing.cc ?? ""} className="input-glass w-full mt-1" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Kilometre</span>
            <input name="km" type="number" min={0} defaultValue={listing.km ?? ""} className="input-glass w-full mt-1" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Renk</span>
            <input name="renk" defaultValue={listing.renk ?? ""} className="input-glass w-full mt-1" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Fiyat (₺) *</span>
            <input name="fiyat" type="number" required min={0} step={0.01} defaultValue={Number(listing.fiyat)} className="input-glass w-full mt-1" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Stok Durumu</span>
            <select name="stokDurumu" defaultValue={String(listing.stokDurumu)} className="input-glass w-full mt-1">
              <option value="true">Stokta</option>
              <option value="false">Satıldı</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Yayın Durumu</span>
            <select name="isActive" defaultValue={String(listing.isActive)} className="input-glass w-full mt-1">
              <option value="true">Yayında</option>
              <option value="false">Gizli (taslak)</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <MultiImageUploader
              name="images"
              defaultValues={listing.images}
              folder="motosikletler"
              label="Görseller (ilk görsel kapak olur)"
            />
          </div>
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Açıklama</span>
            <textarea name="aciklama" rows={4} defaultValue={listing.aciklama ?? ""} className="input-glass w-full mt-1 resize-none" />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Link
            href="/admin/motosikletler"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70"
          >
            İptal
          </Link>
          <button
            type="submit"
            className="rounded-full bg-brand-yellow px-5 py-2 text-sm font-semibold text-brand-black"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
