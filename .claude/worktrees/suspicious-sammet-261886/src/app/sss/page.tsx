import type { Metadata } from "next";
import { InfoPageHero } from "@/components/InfoPageHero";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FAQS } from "@/config/faq";
import { buildPageMetadata } from "@/lib/page-meta";
import { getSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/sss", {
    title: "Sıkça Sorulan Sorular",
    description: "Kargo, iade, ödeme, randevu ve uyumluluk hakkında sıkça sorulan sorular.",
  });
}

export default async function SSSPage() {
  // SiteSetting'den sss_items oku; yoksa config fallback
  const bag = await getSettings(["sss_items"]);
  let faqs: { q: string; a: string }[] = FAQS;
  if (bag.sss_items) {
    try { faqs = JSON.parse(bag.sss_items); } catch {}
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InfoPageHero
        eyebrow="SSS"
        title={<>Sıkça <span className="text-gradient-gold">sorulanlar</span></>}
        description="En çok merak edilen konuları derledik. Cevabını bulamazsan WhatsApp'tan ulaş."
      />
      <div className="mx-auto max-w-3xl px-6 py-14">
        <FaqAccordion items={faqs} defaultOpen={0} />
      </div>
    </>
  );
}
