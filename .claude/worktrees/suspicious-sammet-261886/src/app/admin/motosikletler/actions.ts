"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/admin";

export async function createMotorcycleListing(formData: FormData) {
  await assertAdmin();

  const marka = String(formData.get("marka") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yil = parseInt(String(formData.get("yil") ?? "0"), 10);
  const cc = formData.get("cc") ? parseInt(String(formData.get("cc")), 10) : null;
  const fiyat = parseFloat(String(formData.get("fiyat") ?? "0"));
  const stokDurumu = formData.get("stokDurumu") === "true";
  const gorsel = String(formData.get("gorsel") ?? "").trim() || null;
  const aciklama = String(formData.get("aciklama") ?? "").trim() || null;

  if (!marka || !model || !yil || !fiyat) {
    throw new Error("Marka, model, yıl ve fiyat zorunludur.");
  }

  await prisma.motorcycleListing.create({
    data: { marka, model, yil, cc, fiyat, stokDurumu, gorsel, aciklama },
  });

  revalidatePath("/motosikletler");
  revalidatePath("/admin/motosikletler");
  redirect("/admin/motosikletler");
}

export async function inlineUpdateMotorcycleListing(
  id: string,
  data: {
    marka: string;
    model: string;
    yil: number;
    cc: number | null;
    fiyat: number;
    stokDurumu: boolean;
    gorsel: string | null;
    aciklama: string | null;
  }
) {
  await assertAdmin();

  await prisma.motorcycleListing.update({
    where: { id },
    data,
  });

  revalidatePath("/motosikletler");
  revalidatePath(`/motosikletler/${id}`);
  revalidatePath("/admin/motosikletler");
}

export async function deleteMotorcycleListing(id: string) {
  await assertAdmin();
  await prisma.motorcycleListing.delete({ where: { id } });
  revalidatePath("/motosikletler");
  revalidatePath("/admin/motosikletler");
}
