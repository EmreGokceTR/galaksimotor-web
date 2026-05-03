import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../PostForm";

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Yazıyı Düzenle</h2>
          <p className="text-sm text-white/55">{post.title}</p>
        </div>
        <Link
          href="/admin/blog"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
        >
          ← Geri
        </Link>
      </header>
      <PostForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverUrl: post.coverUrl,
          isPublished: post.isPublished,
        }}
      />
    </div>
  );
}
