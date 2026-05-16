import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  let body: { token?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!token || !email) {
    return NextResponse.json({ error: "Bağlantı geçersiz." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Şifre en az 8 karakter olmalıdır." },
      { status: 400 }
    );
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "Şifre en az bir büyük harf ve bir rakam içermelidir." },
      { status: 400 }
    );
  }

  const tokenHash = hashToken(token);

  const record = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!record || record.identifier !== email || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({ where: { token: tokenHash } });
    }
    return NextResponse.json(
      { error: "Bağlantı geçersiz veya süresi dolmuş." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
    prisma.verificationToken.delete({ where: { token: tokenHash } }),
  ]);

  return NextResponse.json({ ok: true });
}
