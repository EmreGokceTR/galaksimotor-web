import Link from "next/link";
import { PostForm } from "../PostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Yeni Blog Yazısı</h2>
          <p className="text-sm text-white/55">Markdown ile içerik yaz</p>
        </div>
        <Link
          href="/admin/blog"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-brand-yellow"
        >
          ← Geri
        </Link>
      </header>
      <PostForm />
    </div>
  );
}
