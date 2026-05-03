import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditableWrapper } from "@/components/EditableWrapper";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: "Yazı bulunamadı" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverUrl ? [post.coverUrl] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

function renderMarkdown(md: string) {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inQuote = false;

  const closeBlocks = () => {
    if (inList) { out.push("</ul>"); inList = false; }
    if (inOrderedList) { out.push("</ol>"); inOrderedList = false; }
    if (inQuote) { out.push("</blockquote>"); inQuote = false; }
  };

  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-brand-yellow underline">$1</a>'
      )
      .replace(/`([^`]+)`/g, '<code class="rounded bg-white/10 px-1 py-0.5 text-xs">$1</code>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) {
      closeBlocks();
      out.push(`<h1 class="mt-8 text-3xl font-bold text-white">${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      closeBlocks();
      out.push(`<h2 class="mt-7 text-2xl font-bold text-white">${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      closeBlocks();
      out.push(`<h3 class="mt-5 text-xl font-bold text-brand-yellow">${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("> ")) {
      if (!inQuote) {
        closeBlocks();
        out.push('<blockquote class="my-4 rounded-lg border-l-2 border-brand-yellow bg-white/[0.03] py-3 pl-4 italic text-white/80">');
        inQuote = true;
      }
      out.push(`<p>${inline(line.slice(2))}</p>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (!inOrderedList) {
        closeBlocks();
        out.push('<ol class="ml-6 list-decimal space-y-1 text-white/80">');
        inOrderedList = true;
      }
      out.push(`<li>${inline(line.replace(/^\d+\.\s/, ""))}</li>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        closeBlocks();
        out.push('<ul class="ml-6 list-disc space-y-1 text-white/80">');
        inList = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line === "") {
      closeBlocks();
    } else {
      closeBlocks();
      out.push(`<p class="leading-relaxed text-white/80">${inline(line)}</p>`);
    }
  }
  closeBlocks();
  return out.join("\n");
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });
  if (!post || !post.isPublished) notFound();

  const R = ["/blog", `/blog/${post.slug}`];

  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <Link
        href="/blog"
        className="text-xs text-white/45 hover:text-brand-yellow"
      >
        ← Tüm yazılar
      </Link>

      <header className="mt-4">
        <span className="text-[11px] uppercase tracking-wider text-brand-yellow/70">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—"}
        </span>
        <EditableWrapper
          table="blogPost"
          id={post.id}
          field="title"
          value={post.title}
          label="Blog Başlığı"
          revalidatePaths={R}
          as="h1"
          className="mt-2 text-balance text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl"
        >
          <h1 className="mt-2 text-balance text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            {post.title}
          </h1>
        </EditableWrapper>
        <EditableWrapper
          table="blogPost"
          id={post.id}
          field="excerpt"
          value={post.excerpt ?? ""}
          label="Blog Özeti"
          fieldType="textarea"
          revalidatePaths={R}
        >
          {post.excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              {post.excerpt}
            </p>
          ) : null}
        </EditableWrapper>
      </header>

      <EditableWrapper
        table="blogPost"
        id={post.id}
        field="coverUrl"
        value={post.coverUrl ?? ""}
        label="Kapak Görseli (URL)"
        fieldType="image"
        revalidatePaths={R}
      >
        {post.coverUrl ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverUrl}
              alt={post.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}
      </EditableWrapper>

      <EditableWrapper
        table="blogPost"
        id={post.id}
        field="content"
        value={post.content}
        label="Blog İçeriği (Markdown)"
        fieldType="textarea"
        revalidatePaths={R}
      >
        <div
          className="prose prose-invert mt-10 max-w-none space-y-3"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </EditableWrapper>

      <footer className="mt-16 border-t border-white/10 pt-8">
        <Link
          href="/blog"
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/75 hover:border-brand-yellow/40 hover:text-brand-yellow"
        >
          ← Tüm yazılar
        </Link>
      </footer>
    </article>
  );
}
