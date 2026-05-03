import Link from "next/link";
import { upsertPost } from "./actions";

type Props = {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverUrl: string | null;
    isPublished: boolean;
  };
};

export function PostForm({ post }: Props) {
  return (
    <form action={upsertPost} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-md">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlık *" name="title" required defaultValue={post?.title} />
        <Field
          label="Slug (boş bırakılırsa başlıktan üretilir)"
          name="slug"
          defaultValue={post?.slug}
          placeholder="cvt-bakimi-rehberi"
        />
      </div>

      <Field
        label="Kapak Görseli URL"
        name="coverUrl"
        defaultValue={post?.coverUrl ?? ""}
        placeholder="https://... veya /blog/kapak.jpg"
      />

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
          Özet (kısa açıklama)
        </span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          placeholder="Listeleme sayfasında ve SEO meta'sında görünür."
          className="input-glass w-full resize-none rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-xs uppercase tracking-wider text-white/55">
          <span>İçerik *</span>
          <span className="normal-case tracking-normal text-[10px] text-white/40">
            Markdown destekli — # H1, ## H2, **kalın**, [link](url), - liste
          </span>
        </span>
        <textarea
          name="content"
          rows={18}
          required
          defaultValue={post?.content ?? ""}
          placeholder="# Başlık\n\nİçerik..."
          className="input-glass w-full rounded-lg px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/35 outline-none"
        />
      </label>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={post?.isPublished ?? true}
          className="h-4 w-4 accent-brand-yellow"
        />
        <span>
          <span className="block text-sm font-medium text-white">Yayında</span>
          <span className="text-xs text-white/50">
            İşaretlenirse herkese açık. Kapalıysa sadece admin görebilir.
          </span>
        </span>
      </label>

      <div className="flex justify-end gap-2 border-t border-white/10 pt-5">
        <Link href="/admin/blog" className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70">
          İptal
        </Link>
        <button
          type="submit"
          className="rounded-full bg-brand-yellow px-5 py-2 text-sm font-semibold text-brand-black"
        >
          {post ? "Güncelle" : "Yayınla"}
        </button>
      </div>
    </form>
  );
}

function Field(props: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/55">
        {props.label}
      </span>
      <input
        type="text"
        {...props}
        className="input-glass w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
      />
    </label>
  );
}
