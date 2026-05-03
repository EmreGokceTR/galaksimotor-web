import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Server-side admin check. Redirects if not admin. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/giris?callbackUrl=/admin");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

/** For server actions / API: throws on non-admin instead of redirecting. */
export async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Yetkisiz");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin yetkisi yok");
  }
  return session.user.id;
}
