import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings, st } from "@/lib/site-settings";
import { EditableWrapper } from "@/components/EditableWrapper";
import { MotorcycleCard } from "@/components/MotorcycleCard";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { AddRecordButton } from "@/components/AddRecordButton";
import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/motosikletler", {
    title: "Satılık Motosikletler - Galaksi Motor",
    description:
      "Galaksi Motor'da satışa sunulan ikinci el ve sıfır motosikletler.",
  });
}

const R = ["/motosikletler"];

export default async function MotorcyclesPage() {
  const [listings, bag] = await Promise.all([
    prisma.motorcycleListing.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    getSettings([
      "moto_page_eyebrow",
      "moto_page_title1",
      "moto_page_title2",
      "moto_page_desc",
      "moto_empty_title",
      "moto_empty_sub",
    ]),
  ]);

  const eyebrow = st(bag, "moto_page_eyebrow", "· Motosiklet Satışı");
  const title1 = st(bag, "moto_page_title1", "Satılık");
  const title2 = st(bag, "moto_page_title2", "Motosikletler");
  const desc = st(bag, "moto_page_desc", "Seçkin motosikletleri uygun fiyatlarla keşfedin. Tüm araçlar teknik kontrolden geçmiş ve belgelenmiştir.");
  const emptyTitle = st(bag, "moto_empty_title", "Henüz ilan yok");
  const emptySub = st(bag, "moto_empty_sub", "Yakında yeni motosikletler eklenecek.");

  const brands = [...new Set(listings.map((m) => m.marka))].sort();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <AnimatedSection as="div" className="mb-10">
        <div className="mb-4 flex justify-end">
          <AddRecordButton kind="motorcycle" label="Yeni İlan" />
        </div>
        <EditableWrapper
          table="siteSetting"
          id="moto_page_eyebrow"
          field="value"
          value={eyebrow}
          label="Motosikletler Sayfa Üst Etiket"
          revalidatePaths={R}
          as="span"
          className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80"
        >
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">
            {eyebrow}
          </span>
        </EditableWrapper>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
          <EditableWrapper
            table="siteSetting"
            id="moto_page_title1"
            field="value"
            value={title1}
            label="Motosikletler Başlık 1"
            revalidatePaths={R}
            as="span"
          >
            {title1}
          </EditableWrapper>
          {" "}
          <EditableWrapper
            table="siteSetting"
            id="moto_page_title2"
            field="value"
            value={title2}
            label="Motosikletler Başlık 2 (altın)"
            revalidatePaths={R}
            as="span"
            className="text-gradient-gold"
          >
            <span className="text-gradient-gold">{title2}</span>
          </EditableWrapper>
        </h1>
        <EditableWrapper
          table="siteSetting"
          id="moto_page_desc"
          field="value"
          value={desc}
          label="Motosikletler Sayfa Açıklaması"
          fieldType="textarea"
          revalidatePaths={R}
          as="p"
          className="mt-3 max-w-xl text-sm leading-relaxed text-white/55"
        >
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            {desc}
          </p>
        </EditableWrapper>
      </AnimatedSection>

      {/* Brand filter pills */}
      {brands.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {brands.map((brand) => (
            <span
              key={brand}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-md"
            >
              {brand}
            </span>
          ))}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/20">
            <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <circle cx="14" cy="42" r="10" />
              <circle cx="50" cy="42" r="10" />
              <path d="M24 42h12M36 42l8-16h-8l-4 8H20l-4 6" />
            </svg>
          </div>
          <EditableWrapper
            table="siteSetting"
            id="moto_empty_title"
            field="value"
            value={emptyTitle}
            label="Motosikletler: Boş Durum Başlığı"
            revalidatePaths={R}
            as="p"
            className="text-lg font-semibold text-white/50"
          >
            <p className="text-lg font-semibold text-white/50">{emptyTitle}</p>
          </EditableWrapper>
          <EditableWrapper
            table="siteSetting"
            id="moto_empty_sub"
            field="value"
            value={emptySub}
            label="Motosikletler: Boş Durum Alt Yazı"
            revalidatePaths={R}
            as="p"
            className="mt-1 text-sm text-white/30"
          >
            <p className="mt-1 text-sm text-white/30">{emptySub}</p>
          </EditableWrapper>
        </div>
      ) : (
        <AnimatedSection as="div" stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((m, i) => (
            <AnimatedItem key={m.id}>
              <MotorcycleCard
                index={i}
                moto={{
                  id: m.id,
                  marka: m.marka,
                  model: m.model,
                  yil: m.yil,
                  cc: m.cc,
                  fiyat: Number(m.fiyat),
                  stokDurumu: m.stokDurumu,
                  gorsel: m.gorsel,
                  aciklama: m.aciklama,
                }}
              />
            </AnimatedItem>
          ))}
        </AnimatedSection>
      )}
    </div>
  );
}
