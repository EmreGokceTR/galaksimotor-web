"use client";

import { useState, useTransition, type ReactNode, type ElementType } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { updateField } from "@/app/_actions/edit-field";

// ─── Tipler ──────────────────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "number" | "boolean" | "image";

export type EditableWrapperProps = {
  /** Prisma model adı: "product" | "blogPost" | "siteSetting" | "motorcycleListing" | "service" */
  table: string;
  /** Kaydın id veya key'i */
  id: string;
  /** Güncellenecek alan adı (siteSetting için "value" yaz) */
  field: string;
  /** Mevcut değer — tip otomatik algılanır */
  value: string | number | boolean | null;
  /** Modal içindeki alan etiketi */
  label?: string;
  /** Kayıt sonrası yenilenecek sayfalar */
  revalidatePaths?: string[];
  /** Tipi otomatik algılamak yerine zorla */
  fieldType?: FieldType;
  /** HTML kapsayıcı etiketi: blok içerik için "div", satır içi metin için "span" */
  as?: ElementType;
  /** Kapsayıcıya ek class */
  className?: string;
  children: ReactNode;
};

// ─── Yardımcı: otomatik tip algılama ─────────────────────────────────────────

function detectType(field: string, value: unknown): FieldType {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (/url|image|gorsel|photo|cover|avatar/i.test(field)) return "image";
  if (
    /content|description|aciklama|excerpt|body|note|html/i.test(field) ||
    (typeof value === "string" && value.length > 120)
  )
    return "textarea";
  return "text";
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

export function EditableWrapper({
  table,
  id,
  field,
  value,
  label,
  revalidatePaths = [],
  fieldType,
  as: Tag = "div",
  className,
  children,
}: EditableWrapperProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | number | boolean>("");
  const [isPending, startTransition] = useTransition();

  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  // Admin değilse children'ı olduğu gibi döndür — hiç DOM eklemez
  if (!isAdmin) return <>{children}</>;

  const type = fieldType ?? detectType(field, value);
  const displayLabel = label ?? field;

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDraft(
      value ?? (type === "boolean" ? false : type === "number" ? 0 : "")
    );
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      await updateField(table, id, field, draft, revalidatePaths);
      setOpen(false);
    });
  }

  return (
    <>
      <Tag className={`group/edit relative ${className ?? ""}`}>
        {children}

        {/* Kalem ikonu — hover'da görünür */}
        <button
          onClick={handleOpen}
          aria-label="Düzenle"
          className="absolute right-0 top-0 z-10 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-black/80 text-white/70 opacity-0 ring-1 ring-white/20 backdrop-blur-md transition-all duration-150 group-hover/edit:opacity-100 hover:bg-brand-yellow hover:text-brand-black hover:ring-brand-yellow hover:shadow-[0_0_10px_rgba(255,215,0,0.5)]"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" />
          </svg>
        </button>

        {/* Admin için hover çerçevesi */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-sm opacity-0 ring-1 ring-dashed ring-brand-yellow/40 transition-opacity duration-150 group-hover/edit:opacity-100"
        />
      </Tag>

      {/* ─── Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Arka plan */}
            <motion.div
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => !isPending && setOpen(false)}
            />

            {/* Kart */}
            <motion.div
              className="glass-strong relative z-10 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={spring}
            >
              {/* Başlık */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {table} · {field}
                  </p>
                  <h2 className="text-base font-bold text-white">
                    {displayLabel}
                  </h2>
                </div>
                <button
                  onClick={() => !isPending && setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                  >
                    <path d="M3 3l10 10M13 3L3 13" />
                  </svg>
                </button>
              </div>

              {/* Input — tipe göre dinamik */}
              <div className="space-y-3">
                {type === "boolean" && (
                  <button
                    type="button"
                    onClick={() => setDraft((v) => !v)}
                    disabled={isPending}
                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium ring-1 transition-all ${
                      draft
                        ? "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 ring-rose-500/30"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${draft ? "bg-emerald-400" : "bg-rose-400"}`}
                    />
                    {draft ? "Aktif / Evet" : "Pasif / Hayır"}
                  </button>
                )}

                {type === "number" && (
                  <input
                    className="input-glass w-full"
                    type="number"
                    value={draft as number}
                    onChange={(e) =>
                      setDraft(parseFloat(e.target.value) || 0)
                    }
                    disabled={isPending}
                  />
                )}

                {type === "textarea" && (
                  <textarea
                    className="input-glass w-full resize-none"
                    rows={5}
                    value={draft as string}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={isPending}
                  />
                )}

                {(type === "text" || type === "image") && (
                  <input
                    className="input-glass w-full"
                    type="text"
                    value={draft as string}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={isPending}
                  />
                )}

                {type === "image" &&
                  typeof draft === "string" &&
                  draft && (
                    <div className="h-24 w-24 overflow-hidden rounded-lg border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={draft}
                        alt="önizleme"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
              </div>

              {/* Butonlar */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => !isPending && setOpen(false)}
                  disabled={isPending}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-brand-yellow py-2.5 text-sm font-semibold text-brand-black transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Kaydediliyor…
                    </span>
                  ) : (
                    "Kaydet"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
