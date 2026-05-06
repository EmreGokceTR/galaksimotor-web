"use client";

import {
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/context/EditModeContext";
import {
  createProductRecord,
  createMotorcycleListingRecord,
  createBlogPostRecord,
} from "@/app/_actions/create-record";

// ─── Tipler ───────────────────────────────────────────────────────────────────

type CategoryOpt = { id: string; name: string };

export type AddRecordButtonProps =
  | {
      kind: "product";
      categories: CategoryOpt[];
      label?: string;
      className?: string;
    }
  | {
      kind: "motorcycle";
      label?: string;
      className?: string;
    }
  | {
      kind: "blog";
      label?: string;
      className?: string;
    };

type FormState = Record<string, string>;

const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export function AddRecordButton(props: AddRecordButtonProps) {
  const { data: session } = useSession();
  const { isEditMode } = useEditMode();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  if (!isAdmin || !isEditMode) return null;

  function setField(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function reset() {
    setForm({});
    setError(null);
  }

  function close() {
    if (isPending) return;
    setOpen(false);
    reset();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (props.kind === "product") {
          await createProductRecord({
            name: form.name ?? "",
            description: form.description,
            price: parseFloat(form.price ?? "0"),
            imageUrl: form.imageUrl,
            categoryId: form.categoryId ?? props.categories[0]?.id ?? "",
          });
        } else if (props.kind === "motorcycle") {
          await createMotorcycleListingRecord({
            marka: form.marka ?? "",
            model: form.model ?? "",
            yil: parseInt(form.yil ?? "0", 10),
            fiyat: parseFloat(form.fiyat ?? "0"),
            cc: form.cc ? parseInt(form.cc, 10) : undefined,
            gorsel: form.gorsel,
            aciklama: form.aciklama,
          });
        } else {
          await createBlogPostRecord({
            title: form.title ?? "",
            excerpt: form.excerpt,
            content: form.content,
            coverUrl: form.coverUrl,
          });
        }
        setOpen(false);
        reset();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata.");
      }
    });
  }

  const buttonLabel = props.label ?? "Yeni Ekle";

  const titleByKind: Record<string, string> = {
    product: "Yeni Ürün",
    motorcycle: "Yeni Motosiklet İlanı",
    blog: "Yeni Blog Yazısı",
  };

  return (
    <>
      {/* Tetikleyici buton */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`group inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.65)] ring-1 ring-brand-yellow/50 transition-all hover:shadow-[0_10px_32px_-6px_rgba(255,215,0,0.85)] ${
          props.className ?? ""
        }`}
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 transition-transform group-hover:rotate-90"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
        {buttonLabel}
      </motion.button>

      {/* Modal */}
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
              onClick={close}
            />
            <motion.div
              className="glass-strong relative z-10 w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={spring}
            >
              {/* Başlık */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-yellow/70">
                    Yeni Kayıt
                  </p>
                  <h2 className="text-base font-bold text-white">
                    {titleByKind[props.kind]}
                  </h2>
                </div>
                <button
                  onClick={close}
                  type="button"
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

              <form
                onSubmit={handleSubmit}
                className="max-h-[70vh] space-y-3 overflow-y-auto pr-1"
              >
                {/* Ürün */}
                {props.kind === "product" && (
                  <>
                    <FieldText
                      label="Ürün Adı *"
                      value={form.name ?? ""}
                      onChange={(v) => setField("name", v)}
                      disabled={isPending}
                      required
                    />
                    <FieldSelect
                      label="Kategori *"
                      value={form.categoryId ?? props.categories[0]?.id ?? ""}
                      onChange={(v) => setField("categoryId", v)}
                      options={props.categories.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                      disabled={isPending}
                    />
                    <FieldText
                      label="Fiyat (₺) *"
                      type="number"
                      value={form.price ?? ""}
                      onChange={(v) => setField("price", v)}
                      disabled={isPending}
                      required
                    />
                    <FieldImage
                      label="Görsel URL"
                      value={form.imageUrl ?? ""}
                      onChange={(v) => setField("imageUrl", v)}
                      disabled={isPending}
                    />
                    <FieldTextarea
                      label="Açıklama"
                      value={form.description ?? ""}
                      onChange={(v) => setField("description", v)}
                      disabled={isPending}
                    />
                  </>
                )}

                {/* Motosiklet */}
                {props.kind === "motorcycle" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <FieldText
                        label="Marka *"
                        value={form.marka ?? ""}
                        onChange={(v) => setField("marka", v)}
                        disabled={isPending}
                        required
                      />
                      <FieldText
                        label="Model *"
                        value={form.model ?? ""}
                        onChange={(v) => setField("model", v)}
                        disabled={isPending}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FieldText
                        label="Yıl *"
                        type="number"
                        value={form.yil ?? ""}
                        onChange={(v) => setField("yil", v)}
                        disabled={isPending}
                        required
                      />
                      <FieldText
                        label="CC"
                        type="number"
                        value={form.cc ?? ""}
                        onChange={(v) => setField("cc", v)}
                        disabled={isPending}
                      />
                    </div>
                    <FieldText
                      label="Fiyat (₺) *"
                      type="number"
                      value={form.fiyat ?? ""}
                      onChange={(v) => setField("fiyat", v)}
                      disabled={isPending}
                      required
                    />
                    <FieldImage
                      label="Görsel URL"
                      value={form.gorsel ?? ""}
                      onChange={(v) => setField("gorsel", v)}
                      disabled={isPending}
                    />
                    <FieldTextarea
                      label="Açıklama"
                      value={form.aciklama ?? ""}
                      onChange={(v) => setField("aciklama", v)}
                      disabled={isPending}
                    />
                  </>
                )}

                {/* Blog */}
                {props.kind === "blog" && (
                  <>
                    <FieldText
                      label="Başlık *"
                      value={form.title ?? ""}
                      onChange={(v) => setField("title", v)}
                      disabled={isPending}
                      required
                    />
                    <FieldImage
                      label="Kapak Görsel URL"
                      value={form.coverUrl ?? ""}
                      onChange={(v) => setField("coverUrl", v)}
                      disabled={isPending}
                    />
                    <FieldTextarea
                      label="Özet"
                      value={form.excerpt ?? ""}
                      onChange={(v) => setField("excerpt", v)}
                      disabled={isPending}
                      rows={3}
                    />
                    <FieldTextarea
                      label="İçerik (HTML)"
                      value={form.content ?? ""}
                      onChange={(v) => setField("content", v)}
                      disabled={isPending}
                      rows={6}
                    />
                    <p className="text-[11px] text-white/40">
                      Yeni yazı taslak olarak oluşturulur. Yayına almak için admin
                      panelinden &quot;Yayında&quot; durumuna alın.
                    </p>
                  </>
                )}

                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                    {error}
                  </div>
                )}

                <div className="mt-2 flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={close}
                    disabled={isPending}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-xl bg-brand-yellow py-2.5 text-sm font-semibold text-brand-black transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {isPending ? "Oluşturuluyor…" : "Oluştur"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Form alanları ────────────────────────────────────────────────────────────

function Wrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}

function FieldText({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  type?: "text" | "number";
  required?: boolean;
}) {
  return (
    <Wrap label={label}>
      <input
        className="input-glass w-full"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        step={type === "number" ? "any" : undefined}
      />
    </Wrap>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  disabled,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  rows?: number;
}) {
  return (
    <Wrap label={label}>
      <textarea
        className="input-glass w-full resize-none"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </Wrap>
  );
}

function FieldImage({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <Wrap label={label}>
      <input
        className="input-glass w-full"
        type="text"
        placeholder="https://..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {value.trim() && (
        <div className="mt-2 h-24 w-24 overflow-hidden rounded-lg border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="önizleme"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </Wrap>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled: boolean;
}) {
  return (
    <Wrap label={label}>
      <select
        className="input-glass w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-brand-black">
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}
