"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";

export async function saveTasarim(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();

    const pairs: [string, string][] = [
      ["theme_font", (formData.get("theme_font") as string | null) ?? "inter"],
      ["theme_font_scale", (formData.get("theme_font_scale") as string | null) ?? "100"],
    ];

    await Promise.all(
      pairs.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: "text", label: key },
        })
      )
    );

    // Revalidate entire site since typography affects every page
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
