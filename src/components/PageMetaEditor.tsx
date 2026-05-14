"use client";

import { useState, useTransition, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/context/EditModeContext";
import { updateField } from "@/app/_actions/edit-field";
import { pathKey } from "@/lib/page-meta";

const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

export function PageMetaEditor() {
  const { data: session } = useSession();
  const { isEditMode } = useEditMode();
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isPending, startTransition] = useTransition();

  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  // Modal açıldığında DOM'dan mevcut title/description'ı oku
  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;
    setTitle(document.title);
    const meta = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    setDesc(meta?.content ?? "");
  }, [open]);

  if (!isAdmin || !isEditMode) return null;

  const k = pathKey(pathname);

  function handleSave() {
    startTransition(async () => {
      await updateField(
        "siteSetting",
        `meta_title_${k}`,
        "value",
        title,
        [pathname]
      );
      await updateField(
        "siteSetting",
        `meta_desc_${k}`,
        "value",
        desc,
        [pathname]
      );
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-1 text-[11px] font-semibold text-brand-yellow ring-1 ring-brand-yellow/20 backdrop-blur-md transition-colors hover:bg-brand-yellow/20"
        title={`Bu sayfanın SEO'sunu düzenle (${pathname})`}
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M2 8h12M8 2c1.8 2 2.8 4 2.8 6s-1 4-2.8 6c-1.8-2-2.8-4-2.8-6s1-4 2.8-6z" />
        </svg>
        SEO
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => !isPending && setOpen(false)}
            />
            <motion.div
              className="glass-strong relative z-10 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={spring}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-yellow/70">
                    SEO · {pathname}
                  </p>
                  <h2 className="text-base font-bold text-white">
                    Sayfa Meta Bilgileri
                  </h2>
                </div>
                <button
                  type="button"
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

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                    Sayfa Başlığı (title)
                  </span>
                  <input
                    className="input-glass w-full"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPending}
                    maxLength={120}
                  />
                  <span className="mt-1 block text-[10px] text-white/30">
                    {title.length}/60 önerilen · siteSetting key:{" "}
                    <code className="text-brand-yellow/60">
                      meta_title_{k}
                    </code>
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
                    Açıklama (description)
                  </span>
                  <textarea
                    className="input-glass w-full resize-none"
                    rows={4}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    disabled={isPending}
                    maxLength={300}
                  />
                  <span className="mt-1 block text-[10px] text-white/30">
                    {desc.length}/160 önerilen · siteSetting key:{" "}
                    <code className="text-brand-yellow/60">
                      meta_desc_{k}
                    </code>
                  </span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => !isPending && setOpen(false)}
                  disabled={isPending}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-brand-yellow py-2.5 text-sm font-semibold text-brand-black transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {isPending ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
