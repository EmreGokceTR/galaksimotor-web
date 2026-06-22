// Hasar/değer kaybı dosyaları için paylaşılan etiketler.

export const CLAIM_STATUS: Record<string, { label: string; tone: string }> = {
  NEW: { label: "Yeni", tone: "bg-amber-500/15 text-amber-300 ring-amber-400/30" },
  CONTACTED: { label: "İletişim kuruldu", tone: "bg-sky-500/15 text-sky-300 ring-sky-400/30" },
  IN_PROGRESS: { label: "Süreçte", tone: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/30" },
  COMPLETED: { label: "Sonuçlandı", tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" },
  REJECTED: { label: "İptal/Uygun değil", tone: "bg-rose-500/15 text-rose-300 ring-rose-400/30" },
};

export const CLAIM_TYPE: Record<string, string> = {
  DEGER_KAYBI: "Değer Kaybı",
  HASAR_IHBAR: "Hasar İhbar",
  HER_IKISI: "Değer Kaybı + Hasar",
};
