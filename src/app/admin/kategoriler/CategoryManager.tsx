"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { upsertCategory, deleteCategory } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  productCount: number;
  childCount: number;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  function loadForm(c: Category | null) {
    setEditing(c);
    setName(c?.name ?? "");
    setSlug(c?.slug ?? "");
    setDescription(c?.description ?? "");
    setParentId(c?.parentId ?? "");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Kategori adı zorunlu.");

    startTransition(async () => {
      const res = await upsertCategory({
        id: editing?.id ?? null,
        name: name.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        parentId: parentId || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      loadForm(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  // Üst kategori seçeneklerinden, düzenlenen kategoriyi çıkar (kendini parent yapamaz)
  const parentOptions = categories.filter((c) => c.id !== editing?.id);
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">
          {editing ? `Düzenle: ${editing.name}` : "Yeni Kategori"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Ad *
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Motor Yağları"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Slug (boş = otomatik)
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="motor-yaglari"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
            Üst Kategori (opsiyonel)
          </span>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
          >
            <option value="">— Ana kategori —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
            Açıklama (opsiyonel)
          </span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          {editing && (
            <button
              type="button"
              onClick={() => loadForm(null)}
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white/70 hover:text-white"
            >
              Vazgeç
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-brand-yellow px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-yellow/80 disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor…" : editing ? "Güncelle" : "Ekle"}
          </button>
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz kategori yok. Yukarıdan ekleyebilirsin.
        </div>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    {c.name}
                  </h3>
                  <span className="font-mono text-[11px] text-white/35">
                    /{c.slug}
                  </span>
                  {c.parentId && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/55">
                      ↳ {nameById.get(c.parentId) ?? "üst kategori"}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-white/45">
                  <span>{c.productCount} ürün</span>
                  {c.childCount > 0 && <span>{c.childCount} alt kategori</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loadForm(c);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/75 hover:text-brand-yellow"
                >
                  Düzenle
                </button>
                <DeleteButton
                  onConfirm={() => handleDelete(c.id)}
                  pending={isPending}
                  disabled={c.productCount > 0 || c.childCount > 0}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeleteButton({
  onConfirm,
  pending,
  disabled,
}: {
  onConfirm: () => void;
  pending: boolean;
  disabled?: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  if (disabled) {
    return (
      <span
        title="İçinde ürün veya alt kategori olduğu için silinemez"
        className="cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/25"
      >
        Sil
      </span>
    );
  }
  if (confirm) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-400 ring-1 ring-rose-400/30 hover:bg-rose-500/30 disabled:opacity-50"
        >
          {pending ? "Siliniyor…" : "Evet, sil"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:text-white"
        >
          İptal
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-rose-400/80 hover:text-rose-400"
    >
      Sil
    </button>
  );
}
