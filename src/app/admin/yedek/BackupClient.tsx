"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cleanupOldActivityLogs } from "@/app/_actions/maintenance";

export function BackupButton() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBackup() {
    setError(null);
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/backup", { method: "GET" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Yedekleme başarısız.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("content-disposition") ?? "";
      const fileMatch = cd.match(/filename="?([^"]+)"?/);
      a.download = fileMatch?.[1] ?? `galaksi-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <motion.button
        type="button"
        onClick={handleBackup}
        disabled={downloading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-black shadow-[0_8px_24px_-8px_rgba(255,215,0,0.65)] transition hover:shadow-[0_10px_32px_-6px_rgba(255,215,0,0.85)] disabled:opacity-60"
      >
        {downloading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
            </svg>
            Hazırlanıyor...
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8M4 7l4 4 4-4M3 14h10" />
            </svg>
            Veritabanı Yedeği İndir (JSON)
          </>
        )}
      </motion.button>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-rose-300"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CleanupButton({
  oldCount,
  totalCount,
}: {
  oldCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleCleanup() {
    if (oldCount === 0) return;
    if (
      !confirm(
        `${oldCount} adet 30 günden eski ActivityLog kaydı silinecek. Devam edilsin mi?`
      )
    )
      return;

    startTransition(async () => {
      const res = await cleanupOldActivityLogs(30);
      if (res.ok) {
        setResult(`✓ ${res.deleted} kayıt arşivlendi.`);
        router.refresh();
      } else {
        setResult(`✕ ${res.error}`);
      }
    });
  }

  return (
    <div>
      <p className="mb-3 text-xs text-white/55">
        Toplam <span className="font-semibold text-white">{totalCount}</span>{" "}
        log kaydı içinde{" "}
        <span className="font-semibold text-amber-300">{oldCount}</span> tanesi
        30 günden eski.
      </p>
      <motion.button
        type="button"
        onClick={handleCleanup}
        disabled={isPending || oldCount === 0}
        whileHover={{ scale: oldCount === 0 ? 1 : 1.02 }}
        whileTap={{ scale: oldCount === 0 ? 1 : 0.98 }}
        className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Temizleniyor..." : "Eski Logları Temizle"}
      </motion.button>
      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-white/65"
          >
            {result}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
