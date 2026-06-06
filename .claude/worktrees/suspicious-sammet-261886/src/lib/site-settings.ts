import { prisma } from "@/lib/prisma";

/** Verilen key'leri tek sorguda çek. Bulunamayanlar fallback ile döner. */
export async function getSettings(
  keys: string[]
): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Bag'den key oku; yoksa fallback döner. */
export function st(
  bag: Record<string, string>,
  key: string,
  fallback: string
): string {
  return bag[key] ?? fallback;
}
