import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

const TOKEN_TTL_MINUTES = 60;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  let email: string;
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Geçerli bir e-posta gir." }, { status: 400 });
  }

  // Kullanıcı varsa link gönder; yoksa da AYNI cevabı dön (enumeration guard).
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.password) {
    // Şifresiz (sadece Google) kullanıcılar için sıfırlama yapma.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expires = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000);

    // Eski tokenları temizle, yenisini ekle.
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: tokenHash, expires },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://galaksimotor.com";
    const resetUrl = `${siteUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    // Fire-and-forget: response doesn't wait for SMTP so timing is
    // identical for existing vs. non-existing users (enumeration guard).
    sendMail(
      email,
      "Galaksi Motor — Şifre Sıfırlama",
      `
      <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
        <h2 style="margin:0 0 12px">Şifre Sıfırlama</h2>
        <p style="font-size:14px;line-height:1.6;color:#444">
          Hesabın için şifre sıfırlama talebinde bulundun. Aşağıdaki butona tıklayarak yeni şifreni belirleyebilirsin. Bağlantı <strong>${TOKEN_TTL_MINUTES} dakika</strong> içinde geçersiz olur.
        </p>
        <p style="margin:24px 0">
          <a href="${resetUrl}"
             style="display:inline-block;background:#FFD700;color:#000;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px">
            Şifremi Sıfırla
          </a>
        </p>
        <p style="font-size:12px;color:#888">
          Buton çalışmazsa bu adresi tarayıcına yapıştır:<br>
          <a href="${resetUrl}" style="color:#aa8800;word-break:break-all">${resetUrl}</a>
        </p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
        <p style="font-size:12px;color:#999">
          Bu talebi sen yapmadıysan bu maili görmezden gelebilirsin. Mevcut şifren değişmeyecek.
        </p>
      </div>
      `
    ).catch((err) => console.error("[forgot-password] e-posta gönderilemedi:", err));
  }

  // Her durumda aynı cevap (enumeration koruması).
  return NextResponse.json({
    ok: true,
    message: "Eğer bu e-posta sistemde kayıtlıysa, sıfırlama bağlantısı gönderildi.",
  });
}
