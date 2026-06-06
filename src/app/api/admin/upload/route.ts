import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

/**
 * Admin dosya yükleme endpoint'i — Vercel Blob storage'a yükler.
 *
 * POST /api/admin/upload
 * Body: multipart/form-data
 *   - file: File (zorunlu)
 *   - folder: string (opsiyonel — örn. "products", "blog", "logos")
 *
 * Response: { url, pathname, size, contentType }
 *
 * Güvenlik:
 *   - Sadece admin erişebilir (assertAdminContext)
 *   - Maks 8 MB
 *   - Sadece resim mime-types (image/*)
 *   - Dosya adı rastgele suffix ile uniqueleştirilir (addRandomSuffix)
 */

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

function sanitizeFolder(input: string | null): string {
  if (!input) return "uploads";
  // Sadece a-z0-9- karakterlerine izin ver, en fazla 32 karakter
  const cleaned = input.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
  return cleaned || "uploads";
}

function sanitizeFilename(name: string): string {
  // Türkçe karakter ve boşlukları normalize et
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 80) || "dosya";
}

export async function POST(req: NextRequest) {
  let admin: { email: string };
  try {
    admin = await assertAdminContext();
  } catch {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz form verisi." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Dosya bulunamadı (file alanı zorunlu)." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Boş dosya." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)} MB). Maks 8 MB.`,
      },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Desteklenmeyen format: ${file.type || "bilinmeyen"}. Sadece görsel dosyaları (JPG, PNG, WebP, GIF, AVIF, SVG).`,
      },
      { status: 400 }
    );
  }

  const folder = sanitizeFolder(String(formData.get("folder") ?? ""));
  const filename = sanitizeFilename(file.name || "dosya");
  const pathname = `${folder}/${filename}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 31536000, // 1 yıl
    });

    await logActivity(admin.email, "upload", "blob:file", {
      pathname: blob.pathname,
      size: file.size,
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      contentType: file.type,
    });
  } catch (err) {
    console.error("Blob upload hatası:", err);
    return NextResponse.json(
      { error: "Yükleme başarısız. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/upload?url=...
 * Yüklenmiş bir dosyayı siler. Admin gerekli.
 */
export async function DELETE(req: NextRequest) {
  let admin: { email: string };
  try {
    admin = await assertAdminContext();
  } catch {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "url parametresi zorunlu." },
      { status: 400 }
    );
  }

  try {
    const { del } = await import("@vercel/blob");
    await del(url);
    await logActivity(admin.email, "delete", "blob:file", { url });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Blob delete hatası:", err);
    return NextResponse.json(
      { error: "Silme başarısız." },
      { status: 500 }
    );
  }
}
