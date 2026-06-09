"use client";

/**
 * ImageUploader — admin formları için tek başına çalışır dosya yükleme alanı.
 *
 * İki kullanım modu:
 *
 *  1) UNCONTROLLED (formData ile gönderim):
 *     <ImageUploader name="imageUrl" defaultValue={...} folder="products" />
 *     → hidden input dolacak, normal <form> ile gönderilir
 *
 *  2) CONTROLLED (state ile yönetim — modallarda, AddRecordButton'da, EditableWrapper'da):
 *     <ImageUploader value={url} onChange={setUrl} folder="blog" />
 *     → name verilmez, hidden input render edilmez, parent state'i yönetir
 *
 * Özellikler:
 *  - Drag & drop + tıklayıp seçme
 *  - Anlık önizleme + "kaldır" butonu
 *  - Vercel Blob'a yükler → URL döner
 *  - Manuel URL yapıştırma da çalışır (geriye dönük uyum)
 *  - 8 MB sınırı, sadece resim mime-type'ları
 *  - Mobilde de touch-friendly
 */

import { useState, useRef, useCallback, useEffect } from "react";

interface ImageUploaderProps {
  /** UNCONTROLLED için: formData alan adı. CONTROLLED için verme. */
  name?: string;
  /** Etiket */
  label?: string;
  /** UNCONTROLLED için başlangıç değeri */
  defaultValue?: string;
  /** CONTROLLED için anlık değer */
  value?: string;
  /** CONTROLLED için onChange handler — yeni URL ile çağrılır */
  onChange?: (url: string) => void;
  /** Blob klasörü (ör. "products", "blog", "logos") */
  folder?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  /** Önizleme boyutu — small (96px) / medium (160px) */
  size?: "small" | "medium";
  /** Kompakt mod — modallarda alan kazanmak için drop zone küçülür */
  compact?: boolean;
}

export function ImageUploader({
  name,
  label = "Görsel",
  defaultValue = "",
  value,
  onChange,
  folder = "uploads",
  required = false,
  placeholder = "https://... veya bilgisayardan seç",
  className = "",
  size = "medium",
  compact = false,
}: ImageUploaderProps) {
  // Controlled mode: value prop verilmişse onu kullan; uncontrolled: kendi state'i tut
  const isControlled = value !== undefined;
  const [internalUrl, setInternalUrl] = useState(defaultValue);
  const url = isControlled ? value : internalUrl;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Controlled değilse, dışarıdan defaultValue değişimini yakala (revalidate sonrası)
  useEffect(() => {
    if (!isControlled) {
      setInternalUrl(defaultValue);
    }
  }, [defaultValue, isControlled]);

  const setUrl = useCallback(
    (next: string) => {
      if (isControlled) {
        onChange?.(next);
      } else {
        setInternalUrl(next);
        onChange?.(next);
      }
    },
    [isControlled, onChange]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > 8 * 1024 * 1024) {
        setError(
          `Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)} MB). Maks 8 MB.`
        );
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Sadece görsel dosyaları yüklenebilir.");
        return;
      }

      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "Yükleme başarısız.");
        }

        setUrl(json.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
      } finally {
        setUploading(false);
      }
    },
    [folder, setUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const previewHeight =
    size === "small" ? "h-24 sm:h-28" : "h-40 sm:h-48";
  const dropPadding = compact ? "px-3 py-3" : "px-4 py-6";

  return (
    <div className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
          {label}
          {required && <span className="text-rose-300"> *</span>}
        </span>
      )}

      {/* Hidden input — sadece uncontrolled mode'da, formData için */}
      {name && (
        <input type="hidden" name={name} value={url} required={required} />
      )}

      <div className="space-y-2.5">
        {/* Önizleme */}
        {url && (
          <div className="relative overflow-hidden rounded-lg border border-white/15 bg-black/30">
            <div className={`relative w-full ${previewHeight}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Önizleme"
                className="h-full w-full object-contain"
                onError={() =>
                  setError("Görsel yüklenemedi. URL'i kontrol edin.")
                }
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setError(null);
              }}
              className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm hover:bg-rose-500/80"
            >
              ✕ Kaldır
            </button>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition ${dropPadding} ${
            dragOver
              ? "border-brand-yellow bg-brand-yellow/10"
              : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />

          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-white/75">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
              </svg>
              Yükleniyor...
            </div>
          ) : (
            <>
              {!compact && (
                <svg viewBox="0 0 24 24" className="mb-2 h-7 w-7 text-white/55" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <p className="text-sm text-white/80">
                <span className="text-brand-yellow underline">Bilgisayardan seç</span>{" "}
                <span className="text-white/55">veya sürükle</span>
              </p>
              {!compact && (
                <p className="mt-1 text-xs text-white/40">
                  JPG, PNG, WebP, GIF, AVIF — maks 8 MB
                </p>
              )}
            </>
          )}
        </div>

        {/* URL manuel giriş */}
        <details className="text-xs text-white/55">
          <summary className="cursor-pointer hover:text-white/80">
            veya görsel URL'i yapıştır
          </summary>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            className="input-glass mt-2 w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
          />
        </details>

        {error && (
          <p className="rounded-md bg-rose-500/15 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
