import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InfoPageHero } from "@/components/InfoPageHero";

export const metadata = {
  title: "Blog & Rehber",
  description:
    "Motosiklet bakım rehberleri, teknik yazılar ve sektör haberleri.",
};

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <InfoPageHero
        eyebrow="Blog & Rehber"
        title={
          <>
            Motorun için <span className="text-gradient-gold">rehberler</span>
          </>
        }
        description="Bakım ipuçları, teknik rehberler ve sektör haberleri — uzmanlarımızdan."
      />

      <div className="mx-auto max-w-7xl px-6 py-14">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
            Henüz blog yazısı yok.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md transition hover:-translate-y-1 hover:border-brand-yellow/40 hover:shadow-[0_0_0_1px_rgba(255,215,0,0.25),0_30px_60px_-20px_rgba(255,215,0,0.25)]"
              >
                <div className="aspect-[16/9] overflow-hidden bg-black/30">
                  {p.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverUrl}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
