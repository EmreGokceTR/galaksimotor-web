"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Fuse from "fuse.js";

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
};

export function BlogList({ posts }: { posts: BlogListItem[] }) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "excerpt", weight: 0.3 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [posts]
  );

  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return posts;
    return fuse.search(q).map((r) => r.item);
  }, [query, fuse, posts]);

  return (
    <>
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Yazılarda ara..."
            className="w-full rounded-full border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none backdrop-blur-md focus:border-brand-yellow/40 focus:ring-2 focus:ring-brand-yellow/20"
          />
          <svg
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="m11 11 3 3" />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        {query && (
          <p className="mt-2 text-xs text-white/45">
            {visible.length} sonuç bulundu
          </p>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          {query
            ? `"${query}" için sonuç bulunamadı.`
            : "Henüz blog yazısı yok."}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md transition hover:-translate-y-1 hover:border-brand-yellow/40 hover:shadow-[0_0_0_1px_rgba(255,215,0,0.25),0_30px_60px_-20px_rgba(255,215,0,0.25)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black/30">
                {p.coverUrl ? (
                  <Image
                    src={p.coverUrl}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="text-[11px] uppercase tracking-wider text-brand-yellow/70">
                  {p.publishedAt
                    ? new Date(p.publishedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </span>
                <h2 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-brand-yellow">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="line-clamp-3 text-sm text-white/60">
                    {p.excerpt}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs text-white/55 transition group-hover:text-brand-yellow">
                  Devamını oku
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
