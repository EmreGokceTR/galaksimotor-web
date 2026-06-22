import { getSettings } from "@/lib/site-settings";
import { SITE } from "@/config/site";

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

const META: Record<string, { label: string; fallback?: string }> = {
  social_facebook: { label: "Facebook", fallback: SITE.social.facebook },
  social_instagram: { label: "Instagram" },
  social_youtube: { label: "YouTube", fallback: SITE.social.youtube },
  social_x: { label: "X (Twitter)" },
  social_tiktok: { label: "TikTok" },
};

/**
 * Sosyal medya linklerini siteSetting'den çek. Boş olanlar dahil edilmez.
 * Ayar hiç girilmemişse SITE.social fallback'ı kullanılır (Facebook/YouTube).
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const bag = await getSettings([...SOCIAL_KEYS]);
  const links: SocialLink[] = [];
  for (const key of SOCIAL_KEYS) {
    const raw = bag[key];
    const url = (raw ?? META[key].fallback ?? "").trim();
    if (url) links.push({ key, label: META[key].label, url });
  }
  return links;
}

/** Admin formu için: her platformun mevcut değeri (boş olabilir). */
export async function getSocialValues(): Promise<Record<string, string>> {
  const bag = await getSettings([...SOCIAL_KEYS]);
  const out: Record<string, string> = {};
  for (const key of SOCIAL_KEYS) {
    out[key] = bag[key] ?? META[key].fallback ?? "";
  }
  return out;
}

export const SOCIAL_META = META;
