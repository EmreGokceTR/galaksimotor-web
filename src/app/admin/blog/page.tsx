import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeletePostButton } from "./DeletePostButton";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Blog Yazıları</h2>
          <p className="text-sm text-white/55">{posts.length} yazı</p>
        </div>
        <Link
          href="/admin/blog/yeni"
          className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-black"
        >
          + Yeni Yazı
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
          Henüz blog yazısı yok.
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 backdrop-blur-md"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-black/30">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                      p.isPublished
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                        : "bg-white/10 text-white/55 ring-1 ring-white/15"
                    }`}
                  >
                    {p.isPublished ? "Yayında" : "Taslak"}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {p.createdAt.toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <h3 className="mt-1 line-clamp-1 text-base font-semibold text-white">
                  {p.title}
                </h3>
                <p className="line-clamp-1 text-xs text-white/50">
                  /blog/{p.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/blog/${p.id}`}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/75 hover:text-brand-yellow"
                >
                  Düzenle
                </Link>
                <DeletePostButton id={p.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
