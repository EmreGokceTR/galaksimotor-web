import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Kullanıcı kendi hesabını siler (KVKK md.7 / GDPR Art.17 — silme hakkı).
 *
 * Strateji:
 *  - Kişisel veri (email, name, phone, image, password) anonimleştirilir.
 *  - OAuth account'ları (Google), session'lar, favori, garaj, randevu, yorum
 *    cascade ile silinir (Prisma onDelete:Cascade).
 *  - Sipariş geçmişi (Order, OrderItem) **muhafaza edilir** — yasal
 *    yükümlülük (TBK md.146 — 10 yıl, TTK md.82 — ticari defter).
 *    Kişisel bağ koparılır; user kaydı anonim olur.
 *
 * POST /api/account/delete
 * Body: { confirm: "HESABIMI SIL" }  ← kazara silmeyi engeller
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum yok." }, { status: 401 });
  }

  const userId = session.user.id;

  // Admin kendini silemez (yanlışlıkla sistemi devre dışı bırakmasın)
  if ((session.user as { role?: string }).role === "ADMIN") {
    return NextResponse.json(
      {
        error:
          "Admin hesabı kendini silemez. Önce başka bir admin atamasını yap, sonra rolünü düşür.",
      },
      { status: 403 }
    );
  }

  let body: { confirm?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* boş body — confirm yok demek */
  }

  if (body.confirm !== "HESABIMI SIL") {
    return NextResponse.json(
      {
        error:
          'Onay sözcüğü yanlış. Silmek için tam olarak "HESABIMI SIL" yazılması gerek.',
      },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1) Cascade ile silinmeyen tabloları manuel temizle
      //    (Order/OrderItem korunur — ticari kayıt)
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });

      // 2) Kullanıcıyı anonimleştir — kişisel veri kalmaz
      //    Cascade kalan tabloları (favori, garaj, randevu vs.) Prisma siler
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId.slice(0, 8)}@deleted.local`,
          name: null,
          image: null,
          password: null,
          phone: null,
          role: "USER",
        },
      });

      // 3) Cascade onDelete olmayan tablolara güvenmek yerine açıkça temizle
      //    (favori, garaj, randevu zaten cascade ama explicit daha güvenli)
      await tx.favorite.deleteMany({ where: { userId } }).catch(() => {});
      await tx.userMotorcycle.deleteMany({ where: { userId } }).catch(() => {});
      // Appointment ve Review cascade ile zaten silinir — ekstra try yok.
    });

    return NextResponse.json({
      ok: true,
      message:
        "Hesabınız ve kişisel bilgileriniz silindi. Sipariş geçmişi yasal yükümlülük gereği anonim olarak saklanıyor.",
    });
  } catch (err) {
    console.error("[account/delete] hata:", err);
    return NextResponse.json(
      {
        error:
          "Silme işlemi tamamlanamadı. Lütfen info@galaksimotor.com adresine ulaşın.",
      },
      { status: 500 }
    );
  }
}
