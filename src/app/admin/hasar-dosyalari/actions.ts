"use server";

import { revalidatePath } from "next/cache";
import { ClaimStatus, ClaimType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";
import { logActivity } from "@/lib/activity-log";

const VALID_STATUS: ClaimStatus[] = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
];

export async function updateClaimStatus(
  id: string,
  status: ClaimStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  if (!VALID_STATUS.includes(status)) {
    return { ok: false, error: "Geçersiz durum." };
  }
  const claim = await prisma.damageClaim.findUnique({
    where: { id },
    select: { claimNumber: true },
  });
  if (!claim) return { ok: false, error: "Dosya bulunamadı." };

  await prisma.damageClaim.update({ where: { id }, data: { status } });
  await logActivity(email, "claim_status", `claim:${id}`, {
    claimNumber: claim.claimNumber,
    status,
  });
  revalidatePath("/admin/hasar-dosyalari");
  revalidatePath(`/admin/hasar-dosyalari/${id}`);
  return { ok: true };
}

export async function updateClaimDetails(input: {
  id: string;
  type?: ClaimType;
  adminNote?: string | null;
  estimatedValue?: number | null;
  faultStatus?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  const claim = await prisma.damageClaim.findUnique({
    where: { id: input.id },
    select: { claimNumber: true },
  });
  if (!claim) return { ok: false, error: "Dosya bulunamadı." };

  await prisma.damageClaim.update({
    where: { id: input.id },
    data: {
      ...(input.type ? { type: input.type } : {}),
      adminNote: input.adminNote === undefined ? undefined : input.adminNote,
      estimatedValue:
        input.estimatedValue === undefined ? undefined : input.estimatedValue,
      faultStatus:
        input.faultStatus === undefined ? undefined : input.faultStatus,
    },
  });
  await logActivity(email, "claim_update", `claim:${input.id}`, {
    claimNumber: claim.claimNumber,
  });
  revalidatePath("/admin/hasar-dosyalari");
  revalidatePath(`/admin/hasar-dosyalari/${input.id}`);
  return { ok: true };
}

export async function deleteClaim(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { email } = await assertAdminContext();
  const claim = await prisma.damageClaim.findUnique({
    where: { id },
    select: { claimNumber: true },
  });
  if (!claim) return { ok: false, error: "Dosya bulunamadı." };

  await prisma.damageClaim.delete({ where: { id } });
  await logActivity(email, "claim_delete", `claim:${id}`, {
    claimNumber: claim.claimNumber,
  });
  revalidatePath("/admin/hasar-dosyalari");
  return { ok: true };
}
