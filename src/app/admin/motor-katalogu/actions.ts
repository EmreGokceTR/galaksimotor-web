"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";
import { motoSlug } from "@/lib/moto";

const R = ["/admin/motor-katalogu", "/motosiklet"];

function revalidateMotoPages(brand: string, model: string) {
  const brandSlug = motoSlug(brand);
  revalidatePath(`/motosiklet/${brandSlug}`);
  revalidatePath(`/motosiklet/${brandSlug}/${motoSlug(model)}`);
}

export async function upsertMotorcycle(input: {
  id?: string | null;
  brand: string;
  model: string;
  year: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();

  const brand = input.brand?.trim();
  const model = input.model?.trim();
  const year = Number(input.year);

  if (!brand || !model) return { ok: false, error: "Marka ve model zorunlu." };
  if (!year || year < 1950 || year > new Date().getFullYear() + 1) {
    return { ok: false, error: "Geçerli bir yıl girin." };
  }

  // Aynı marka+model+yıl var mı? (kendisi hariç)
  const clash = await prisma.motorcycle.findUnique({
    where: { brand_model_year: { brand, model, year } },
    select: { id: true },
  });
  if (clash && clash.id !== input.id) {
    return { ok: false, error: "Bu marka/model/yıl zaten kayıtlı." };
  }

  try {
    let before: { brand: string; model: string } | null = null;
    if (input.id) {
      before = await prisma.motorcycle.findUnique({
        where: { id: input.id },
        select: { brand: true, model: true },
      });
      await prisma.motorcycle.update({
        where: { id: input.id },
        data: { brand, model, year },
      });
    } else {
      await prisma.motorcycle.create({ data: { brand, model, year } });
    }
    await logActivity(email, input.id ? "motorcycle_update" : "motorcycle_create", `motorcycle:${input.id ?? "new"}`, { brand, model, year });
    for (const p of R) revalidatePath(p);
    revalidateMotoPages(brand, model);
    if (before && (before.brand !== brand || before.model !== model)) {
      revalidateMotoPages(before.brand, before.model);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Kaydedilemedi." };
  }
}

export async function deleteMotorcycle(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();

  const [fitmentCount, ownershipCount, moto] = await Promise.all([
    prisma.fitment.count({ where: { motorcycleId: id } }),
    prisma.userMotorcycle.count({ where: { motorcycleId: id } }),
    prisma.motorcycle.findUnique({ where: { id }, select: { brand: true, model: true } }),
  ]);
  if (!moto) return { ok: false, error: "Kayıt bulunamadı." };
  if (ownershipCount > 0) {
    return { ok: false, error: `${ownershipCount} kullanıcının garajında kayıtlı — silinemez.` };
  }

  // Fitment'lar cascade ile silinir; yine de bilgilendir
  await prisma.motorcycle.delete({ where: { id } });
  await logActivity(email, "motorcycle_delete", `motorcycle:${id}`, {
    brand: moto.brand,
    model: moto.model,
    removedFitments: fitmentCount,
  });
  for (const p of R) revalidatePath(p);
  revalidateMotoPages(moto.brand, moto.model);
  return { ok: true };
}
