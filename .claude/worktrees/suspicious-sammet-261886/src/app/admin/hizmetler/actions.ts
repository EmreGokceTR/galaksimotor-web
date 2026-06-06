"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function upsertService(formData: FormData) {
  await assertAdminContext();

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string).trim();
  const slugRaw = (formData.get("slug") as string | null)?.trim();
  const slug = slugRaw || toSlug(name);
  const description = (formData.get("description") as string | null)?.trim() || null;
  const duration = parseInt(formData.get("duration") as string, 10) || 60;
  const priceRaw = (formData.get("price") as string | null)?.trim();
  const price = priceRaw ? parseFloat(priceRaw) : null;
  const isActive = (formData.getAll("isActive") as string[]).includes("1");

  if (!name) throw new Error("İsim zorunludur.");

  if (id) {
    await prisma.service.update({
      where: { id },
      data: { name, slug, description, duration, price, isActive },
    });
  } else {
    await prisma.service.create({
      data: { name, slug, description, duration, price, isActive },
    });
  }

  revalidatePath("/randevu");
  revalidatePath("/admin/hizmetler");
  redirect("/admin/hizmetler");
}

export async function deleteService(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();
    await prisma.service.delete({ where: { id } });
    revalidatePath("/randevu");
    revalidatePath("/admin/hizmetler");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Silinemedi." };
  }
}
