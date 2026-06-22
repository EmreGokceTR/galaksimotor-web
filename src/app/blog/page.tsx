import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { InfoPageHero } from "@/components/InfoPageHero";
import { AddRecordButton } from "@/components/AddRecordButton";
import { buildPageMetadata } from "@/lib/page-meta";
import { BlogList, type BlogListItem } from "./BlogList";

// Planlı yayınların zamanı gelince otomatik görünmesi için periyodik yenileme.
export const revalidate = 1800; // 30 dk

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/blog", {
    title: "Blog & Rehber",
    description:
      "Motosiklet bakım rehberleri, teknik yazılar ve sektör haberleri.",
  });
}

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    // Yayında + yayın tarihi geçmiş olanlar (planlı/ileri tarihli gizli)
    where: { isPublished: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });

  const items: BlogListItem[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverUrl: p.coverUrl,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
  }));

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
        <div className="mb-6 flex justify-end">
          <AddRecordButton kind="blog" label="Yeni Yazı" />
        </div>
        <BlogList posts={items} />
      </div>
    </>
  );
}
