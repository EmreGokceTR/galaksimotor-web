"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

function parseListingForm(formData: FormData) {
  const marka = String(formData.get("marka") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yil = parseInt(String(formData.get("yil") ?? "0"), 10);
  const cc = formData.get("cc") ? parseInt(String(formData.get("cc")), 10) : null;
  const km = formData.get("km") ? parseInt(String(formData.get("km")), 10) : null;
  const renk = String(formData.get("renk") ?? "").trim() || null;
  const fiyat = parseFloat(String(formData.get("fiyat") ?? "0"));
  const stokDurumu = formData.get("stokDurumu") === "true";
  const isActive = formData.get("isActive") !== "false";
  const aciklama = String(formData.get("aciklama") ?? "").trim() || null;
  const images = formData
    .getAll("images")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!marka || !model || !yil || !fiyat) {
    throw new Error("Marka, model, yıl ve fiyat zorunludur.");
  }

  return { marka, model, yil, cc, km, renk, fiyat, stokDurumu, isActive, aciklama, images };
}

export async function createMotorcycleListing(formData: FormData) {
  const { email } = await assertAdminContext();
  const data = parseListingForm(formData);

  const listing = await prisma.motorcycleListing.create({ data });
  await logActivity(email, "motorcycle_listing_create", `motorcycleListing:${listing.id}`, {
    marka: data.marka,
    model: data.model,
  });

  revalidatePath("/motosikletler");
  revalidatePath("/admin/motosikletler");
  redirect("/admin/motosikletler");
}

export async function updateMotorcycleListing(formData: FormData) {
  const { email } = await assertAdminContext();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("İlan kimliği eksik.");
  const data = parseListingForm(formData);

  await prisma.motorcycleListing.update({ where: { id }, data });
  await logActivity(email, "motorcycle_listing_update", `motorcycleListing:${id}`, {
    marka: data.marka,
    model: data.model,
  });

  revalidatePath("/motosikletler");
  revalidatePath(`/motosikletler/${id}`);
  revalidatePath("/admin/motosikletler");
  redirect("/admin/motosikletler");
}

export async function deleteMotorcycleListing(id: string) {
  const { email } = await assertAdminContext();
  const listing = await prisma.motorcycleListing.delete({ where: { id } });
  await logActivity(email, "motorcycle_listing_delete", `motorcycleListing:${id}`, {
    marka: listing.marka,
    model: listing.model,
  });
  revalidatePath("/motosikletler");
  revalidatePath(`/motosikletler/${id}`);
  revalidatePath("/admin/motosikletler");
}
