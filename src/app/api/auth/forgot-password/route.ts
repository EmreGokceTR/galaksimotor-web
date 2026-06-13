import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { passwordResetTemplate } from "@/lib/email-templates";

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
    const tpl = passwordResetTemplate({
      resetUrl,
      ttlMinutes: TOKEN_TTL_MINUTES,
    });
    void sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      category: "password_reset",
      actor: email,
    });
  }

  // Her durumda aynı cevap (enumeration koruması).
  return NextResponse.json({
    ok: true,
    message: "Eğer bu e-posta sistemde kayıtlıysa, sıfırlama bağlantısı gönderildi.",
  });
}
