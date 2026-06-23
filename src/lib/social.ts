import { getSettings } from "@/lib/site-settings";

export type SocialLink = {
  key: string;
  label: string;
  url: string;
};

export const SOCIAL_KEYS = [
  "social_facebook",
  "social_instagram",
  "social_youtube",
  "social_x",
  "social_tiktok",
] as const;

const META: Record<string, { label: string }> = {
  social_facebook: { label: "Facebook" },
  social_instagram: { label: "Instagram" },
  social_youtube: { label: "YouTube" },
  social_x: { label: "X (Twitter)" },
  social_tiktok: { label: "TikTok" },
};

/**
 * Sosyal medya linklerini siteSetting'den çek. SADECE admin'in girdiği dolu
 * linkler döner — varsayılan/placeholder link iddia edilmez. Hiç link
 * girilmemişse boş döner (footer'da gösterilmez, SEO sameAs'a eklenmez).
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const bag = await getSettings([...SOCIAL_KEYS]);
  const links: SocialLink[] = [];
  for (const key of SOCIAL_KEYS) {
    const url = (bag[key] ?? "").trim();
    if (url) links.push({ key, label: META[key].label, url });
  }
  return links;
}

/** Admin formu için: her platformun mevcut değeri (boş olabilir). */
export async function getSocialValues(): Promise<Record<string, string>> {
  const bag = await getSettings([...SOCIAL_KEYS]);
  const out: Record<string, string> = {};
  for (const key of SOCIAL_KEYS) {
    out[key] = bag[key] ?? "";
  }
  return out;
}

export const SOCIAL_META = META;
