"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminContext } from "@/lib/admin";

const KEYS = [
  "testimonials_count",
  "t1_name","t1_bike","t1_rating","t1_text","t1_photo",
  "t2_name","t2_bike","t2_rating","t2_text","t2_photo",
  "t3_name","t3_bike","t3_rating","t3_text","t3_photo",
  "t4_name","t4_bike","t4_rating","t4_text","t4_photo",
  "t5_name","t5_bike","t5_rating","t5_text","t5_photo",
] as const;

export async function saveTestimonials(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdminContext();
    await Promise.all(
      KEYS.map((key) => {
        const value = (formData.get(key) as string | null) ?? "";
        return prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: "text", label: key },
        });
      })
    );
    revalidatePath("/");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
}
