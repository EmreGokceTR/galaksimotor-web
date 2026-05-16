"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: string;
  authorImage: string | null;
};

type Summary = { count: number; avg: number };

export function ReviewSection({ productId }: { productId: string }) {
  const { status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>({ count: 0, avg: 0 });
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setSummary(data.summary ?? { count: 0, avg: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Lütfen yıldız ver.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Hata oluştu.");
        setSubmitting(false);
        return;
      }
      setShowForm(false);
      setComment("");
      setRating(0);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">
            · Yorumlar
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            Müşteri değerlendirmeleri
          </h2>
        </div>
        {summary.count > 0 && (
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <Stars value={summary.avg} />
            <span className="text-sm text-white/80">
              <strong className="text-white">{summary.avg.toFixed(1)}</strong> ·{" "}
              {summary.count} yorum
            </span>
          </div>
        )}
      </header>

      {/* Add review */}
      <div className="mb-6">
        {status === "authenticated" ? (
          showForm ? (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submit}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm text-white/70">Puan ver:</span>
                <div
                  className="flex gap-1"
                  onMouseLeave={() => setHover(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      className="transition-transform hover:scale-110"
                      aria-label={`${n} yıldız`}
                    >
                      <Star
                        active={
                          hover ? n <= hover : n <= rating
                        }
                        size={26}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Deneyimini paylaş (opsiyonel)..."
                className="input-glass mb-3 w-full resize-none rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
              />
              {error && (
                <div className="mb-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-brand-yellow px-5 py-2 text-sm font-semibold text-brand-black hover:bg-yellow-300 disabled:opacity-50"
                >
                  {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white"
                >
                  İptal
                </button>
              </div>
            </motion.form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-full border border-brand-yellow/40 bg-brand-yellow/10 px-5 py-2.5 text-sm font-medium text-brand-yellow hover:bg-brand-yellow/20"
            >
              ✏ Yorum Yaz
            </button>
          )
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-3 text-sm text-white/65 backdrop-blur-md">
            Yorum yazmak için{" "}
            <Link href="/giris" className="text-brand-yellow underline">
              giriş yap
            </Link>
            .
          </p>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/55 backdrop-blur-md">
          Yükleniyor...
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/45 backdrop-blur-md">
          İlk yorumu sen yaz!
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence>
            {reviews.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow/15 text-sm font-bold text-brand-yellow ring-1 ring-brand-yellow/30">
                      {r.author.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {r.author}
                      </div>
                      <div className="text-[11px] text-white/55">
                        {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.comment && (
                  <p className="text-sm leading-relaxed text-white/75">
                    {r.comment}
                  </p>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} active={n <= Math.round(value)} size={16} />
      ))}
    </div>
  );
}

function Star({ active, size = 18 }: { active: boolean; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={active ? "#FFD700" : "none"}
      stroke={active ? "#FFD700" : "rgba(255,255,255,0.3)"}
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </svg>
  );
}
