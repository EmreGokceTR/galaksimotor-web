import { InfoPageHero } from "@/components/InfoPageHero";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FAQS } from "@/config/faq";

export const metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "Kargo, iade, ödeme, randevu ve uyumluluk hakkında sıkça sorulan sorular.",
};

export default function SSSPage() {
  // FAQ JSON-LD for SEO rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
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
        title={
          <>
            Sıkça <span className="text-gradient-gold">sorulanlar</span>
          </>
        }
        description="En çok merak edilen konuları derledik. Cevabını bulamazsan WhatsApp'tan ulaş."
      />
      <div className="mx-auto max-w-3xl px-6 py-14">
        <FaqAccordion items={FAQS} defaultOpen={0} />
      </div>
    </>
  );
}
