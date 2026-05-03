import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings, st } from "@/lib/site-settings";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { HomeHero, type HeroSettings } from "@/components/HomeHero";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { FaqAccordion } from "@/components/FaqAccordion";
import { EditableWrapper } from "@/components/EditableWrapper";
import { FAQS } from "@/config/faq";

const R = ["/"];

export default async function HomePage() {
  // Categories first — need slugs for dynamic icon setting keys
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });

  const [featured, latestPosts, bag] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    getSettings([
      // Hero
      "hero_badge", "hero_title_1", "hero_title_2", "hero_title_3", "hero_subtitle",
      "hero_cta_primary", "hero_cta_secondary", "hero_scroll",
      "hero_stat_1_v", "hero_stat_1_l", "hero_stat_2_v", "hero_stat_2_l",
      "hero_stat_3_v", "hero_stat_3_l", "hero_stat_4_v", "hero_stat_4_l",
      // Sections
      "sec_cat_badge", "sec_cat_title", "sec_cat_accent", "sec_cat_cta",
      "sec_feat_badge", "sec_feat_title", "sec_feat_sub", "sec_feat_cta",
      "sec_why_badge", "sec_why_title", "sec_why_accent",
      "sec_why_1_title", "sec_why_1_desc",
      "sec_why_2_title", "sec_why_2_desc",
      "sec_why_3_title", "sec_why_3_desc",
      "sec_test_badge", "sec_test_title", "sec_test_accent",
      "sec_blog_badge", "sec_blog_title", "sec_blog_accent", "sec_blog_cta",
      "sec_faq_badge", "sec_faq_title", "sec_faq_accent", "sec_faq_cta",
      "sec_cta_badge", "sec_cta_title", "sec_cta_accent", "sec_cta_desc", "sec_cta_button",
      // Category cards
      "cat_cta",
      ...categories.map((c) => `cat_icon_${c.slug}`),
    ]),
  ]);

  const heroSettings: HeroSettings = {
    badge:        st(bag, "hero_badge",         "Küçükçekmece'nin motosiklet üssü"),
    title1:       st(bag, "hero_title_1",        "Motorunun"),
    title2:       st(bag, "hero_title_2",        "tüm ihtiyacı,"),
    title3:       st(bag, "hero_title_3",        "tek adreste."),
    subtitle:     st(bag, "hero_subtitle",       "Orijinal yedek parça, profesyonel bakım ürünleri ve şık aksesuarlar — uzman servis ekibiyle. Yola çıkmaktan ibaret kalsın."),
    ctaPrimary:   st(bag, "hero_cta_primary",    "Ürünleri Keşfet"),
    ctaSecondary: st(bag, "hero_cta_secondary",  "Servis Randevusu"),
    scrollText:   st(bag, "hero_scroll",         "Aşağı"),
    stat1v: st(bag, "hero_stat_1_v", "500+"),  stat1l: st(bag, "hero_stat_1_l", "Ürün"),
    stat2v: st(bag, "hero_stat_2_v", "1.5K+"), stat2l: st(bag, "hero_stat_2_l", "Müşteri"),
    stat3v: st(bag, "hero_stat_3_v", "24h"),   stat3l: st(bag, "hero_stat_3_l", "Kargo"),
    stat4v: st(bag, "hero_stat_4_v", "10+"),   stat4l: st(bag, "hero_stat_4_l", "Yıl tecrübe"),
  };

  const whyFeatures = [
    { titleKey: "sec_why_1_title", descKey: "sec_why_1_desc",
      title: st(bag, "sec_why_1_title", "Orijinal Parça Garantisi"),
      desc:  st(bag, "sec_why_1_desc",  "Her ürün distribütör onaylı, faturalı ve değişim güvencesiyle gelir."),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg> },
    { titleKey: "sec_why_2_title", descKey: "sec_why_2_desc",
      title: st(bag, "sec_why_2_title", "Aynı Gün Kargo"),
      desc:  st(bag, "sec_why_2_desc",  "16:00'a kadar verilen siparişler aynı gün kargoya teslim edilir."),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="13" height="11" rx="1.5" /><path d="M15 10h4l3 3v5h-7" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></svg> },
    { titleKey: "sec_why_3_title", descKey: "sec_why_3_desc",
      title: st(bag, "sec_why_3_title", "Uzman Servis Ekibi"),
      desc:  st(bag, "sec_why_3_desc",  "10+ yıl tecrübeli ustalarımızla bakım ve tamir hizmeti."),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z" /></svg> },
  ];

  const catCta = st(bag, "cat_cta", "Keşfet");

  return (
    <>
      <HomeHero settings={heroSettings} />

      {/* ── Kategoriler ── */}
      <AnimatedSection as="section" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <EditableWrapper table="siteSetting" id="sec_cat_badge" field="value" value={st(bag,"sec_cat_badge","· Kategoriler")} label="Kategoriler Badge" revalidatePaths={R}>
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">{st(bag,"sec_cat_badge","· Kategoriler")}</span>
            </EditableWrapper>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              <EditableWrapper table="siteSetting" id="sec_cat_title" field="value" value={st(bag,"sec_cat_title","İhtiyacın olan her şey,")} label="Kategoriler Başlık" revalidatePaths={R} as="span">
                {st(bag,"sec_cat_title","İhtiyacın olan her şey,")}
              </EditableWrapper>{" "}
              <EditableWrapper table="siteSetting" id="sec_cat_accent" field="value" value={st(bag,"sec_cat_accent","bir tık ötede")} label="Kategoriler Başlık Aksan" revalidatePaths={R} as="span" className="text-gradient-gold">
                <span className="text-gradient-gold">{st(bag,"sec_cat_accent","bir tık ötede")}</span>
              </EditableWrapper>
            </h2>
          </div>
          <Link href="/urunler" className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-brand-yellow">
            <EditableWrapper table="siteSetting" id="sec_cat_cta" field="value" value={st(bag,"sec_cat_cta","Tümünü gör")} label="Kategoriler CTA" revalidatePaths={R} as="span">
              {st(bag,"sec_cat_cta","Tümünü gör")}
            </EditableWrapper>
            <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((c, i) => (
            <CategoryCard
              key={c.id}
              slug={c.slug}
              name={c.name}
              description={c.description}
              index={i}
              ctaText={catCta}
              iconUrl={st(bag, `cat_icon_${c.slug}`, "") || undefined}
              iconSettingKey={`cat_icon_${c.slug}`}
            />
          ))}
        </div>
      </AnimatedSection>

      {/* ── Öne Çıkanlar ── */}
      {featured.length > 0 && (
        <section className="relative mx-auto max-w-7xl px-6 py-20">
          <AnimatedSection as="div" className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <EditableWrapper table="siteSetting" id="sec_feat_badge" field="value" value={st(bag,"sec_feat_badge","· Öne Çıkanlar")} label="Öne Çıkanlar Badge" revalidatePaths={R}>
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">{st(bag,"sec_feat_badge","· Öne Çıkanlar")}</span>
              </EditableWrapper>
              <EditableWrapper table="siteSetting" id="sec_feat_title" field="value" value={st(bag,"sec_feat_title","En çok tercih edilenler")} label="Öne Çıkanlar Başlık" revalidatePaths={R}>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">{st(bag,"sec_feat_title","En çok tercih edilenler")}</h2>
              </EditableWrapper>
              <EditableWrapper table="siteSetting" id="sec_feat_sub" field="value" value={st(bag,"sec_feat_sub","Müşterilerimizin en çok tercih ettiği, stokta hazır ürünler.")} label="Öne Çıkanlar Alt Yazı" fieldType="textarea" revalidatePaths={R}>
                <p className="mt-2 max-w-xl text-sm text-white/55">{st(bag,"sec_feat_sub","Müşterilerimizin en çok tercih ettiği, stokta hazır ürünler.")}</p>
              </EditableWrapper>
            </div>
            <Link href="/urunler" className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition hover:border-brand-yellow/50 hover:text-brand-yellow">
              <EditableWrapper table="siteSetting" id="sec_feat_cta" field="value" value={st(bag,"sec_feat_cta","Tüm ürünler")} label="Öne Çıkanlar CTA" revalidatePaths={R} as="span">
                {st(bag,"sec_feat_cta","Tüm ürünler")}
              </EditableWrapper>
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </Link>
          </AnimatedSection>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProductCard key={p.id} index={i} product={{
                id: p.id, slug: p.slug, name: p.name, sku: p.sku,
                price: Number(p.price), stock: p.stock, brand: p.brand,
                image: p.images[0]?.url ?? null,
                category: { name: p.category.name, slug: p.category.slug },
              }} />
            ))}
          </div>
        </section>
      )}

      {/* ── Neden Biz ── */}
      <AnimatedSection as="section" stagger className="mx-auto max-w-7xl px-6 py-20">
        <AnimatedItem>
          <div className="mb-12 text-center">
            <EditableWrapper table="siteSetting" id="sec_why_badge" field="value" value={st(bag,"sec_why_badge","· Neden Galaksi Motor?")} label="Neden Biz Badge" revalidatePaths={R}>
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">{st(bag,"sec_why_badge","· Neden Galaksi Motor?")}</span>
            </EditableWrapper>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              <EditableWrapper table="siteSetting" id="sec_why_title" field="value" value={st(bag,"sec_why_title","Yola güvenle çıkmanın")} label="Neden Biz Başlık" revalidatePaths={R} as="span">
                {st(bag,"sec_why_title","Yola güvenle çıkmanın")}
              </EditableWrapper>{" "}
              <EditableWrapper table="siteSetting" id="sec_why_accent" field="value" value={st(bag,"sec_why_accent","3 sebebi")} label="Neden Biz Aksan" revalidatePaths={R} as="span" className="text-gradient-gold">
                <span className="text-gradient-gold">{st(bag,"sec_why_accent","3 sebebi")}</span>
              </EditableWrapper>
            </h2>
          </div>
        </AnimatedItem>
        <div className="grid gap-5 md:grid-cols-3">
          {whyFeatures.map((f) => (
            <AnimatedItem key={f.titleKey}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-md transition-all hover:border-brand-yellow/40 hover:bg-white/[0.04]">
                <span className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-yellow/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow/10 text-brand-yellow ring-1 ring-brand-yellow/20 transition group-hover:bg-brand-yellow group-hover:text-brand-black group-hover:shadow-[0_0_24px_-6px_rgba(255,215,0,0.7)]">
                  <span className="block h-6 w-6">{f.icon}</span>
                </div>
                <EditableWrapper table="siteSetting" id={f.titleKey} field="value" value={f.title} label={`Özellik Başlık`} revalidatePaths={R}>
                  <h3 className="text-lg font-semibold tracking-tight text-white">{f.title}</h3>
                </EditableWrapper>
                <EditableWrapper table="siteSetting" id={f.descKey} field="value" value={f.desc} label={`Özellik Açıklama`} fieldType="textarea" revalidatePaths={R}>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
                </EditableWrapper>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Yorumlar ── */}
      <AnimatedSection as="section" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <EditableWrapper table="siteSetting" id="sec_test_badge" field="value" value={st(bag,"sec_test_badge","· Müşterilerimiz ne diyor?")} label="Yorumlar Badge" revalidatePaths={R}>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">{st(bag,"sec_test_badge","· Müşterilerimiz ne diyor?")}</span>
          </EditableWrapper>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            <EditableWrapper table="siteSetting" id="sec_test_title" field="value" value={st(bag,"sec_test_title","Binlerce")} label="Yorumlar Başlık (altın)" revalidatePaths={R} as="span" className="text-gradient-gold">
              <span className="text-gradient-gold">{st(bag,"sec_test_title","Binlerce")}</span>
            </EditableWrapper>{" "}
            <EditableWrapper table="siteSetting" id="sec_test_accent" field="value" value={st(bag,"sec_test_accent","mutlu sürücü")} label="Yorumlar Başlık (devam)" revalidatePaths={R} as="span">
              {st(bag,"sec_test_accent","mutlu sürücü")}
            </EditableWrapper>
          </h2>
        </div>
        <TestimonialsCarousel />
      </AnimatedSection>

      {/* ── Blog ── */}
      {latestPosts.length > 0 && (
        <AnimatedSection as="section" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <EditableWrapper table="siteSetting" id="sec_blog_badge" field="value" value={st(bag,"sec_blog_badge","· Blog & Rehber")} label="Blog Badge" revalidatePaths={R}>
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">{st(bag,"sec_blog_badge","· Blog & Rehber")}</span>
              </EditableWrapper>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                <EditableWrapper table="siteSetting" id="sec_blog_title" field="value" value={st(bag,"sec_blog_title","Uzmanlarımızdan")} label="Blog Başlık" revalidatePaths={R} as="span">
                  {st(bag,"sec_blog_title","Uzmanlarımızdan")}
                </EditableWrapper>{" "}
                <EditableWrapper table="siteSetting" id="sec_blog_accent" field="value" value={st(bag,"sec_blog_accent","tavsiyeler")} label="Blog Başlık Aksan" revalidatePaths={R} as="span" className="text-gradient-gold">
                  <span className="text-gradient-gold">{st(bag,"sec_blog_accent","tavsiyeler")}</span>
                </EditableWrapper>
              </h2>
            </div>
            <Link href="/blog" className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:border-brand-yellow/50 hover:text-brand-yellow">
              <EditableWrapper table="siteSetting" id="sec_blog_cta" field="value" value={st(bag,"sec_blog_cta","Tüm yazılar")} label="Blog CTA" revalidatePaths={R} as="span">
                {st(bag,"sec_blog_cta","Tüm yazılar")}
              </EditableWrapper>
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestPosts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition hover:-translate-y-1 hover:border-brand-yellow/40">
                <div className="aspect-[16/9] overflow-hidden bg-black/30">
                  {p.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <span className="text-[11px] uppercase tracking-wider text-brand-yellow/70">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("tr-TR") : ""}
                  </span>
                  <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-brand-yellow">{p.title}</h3>
                  {p.excerpt && <p className="line-clamp-2 text-xs text-white/55">{p.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* ── SSS ── */}
      <AnimatedSection as="section" className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-10 text-center">
          <EditableWrapper table="siteSetting" id="sec_faq_badge" field="value" value={st(bag,"sec_faq_badge","· Sıkça sorulanlar")} label="SSS Badge" revalidatePaths={R}>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-yellow/80">{st(bag,"sec_faq_badge","· Sıkça sorulanlar")}</span>
          </EditableWrapper>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            <EditableWrapper table="siteSetting" id="sec_faq_title" field="value" value={st(bag,"sec_faq_title","Aklındaki")} label="SSS Başlık" revalidatePaths={R} as="span">
              {st(bag,"sec_faq_title","Aklındaki")}
            </EditableWrapper>{" "}
            <EditableWrapper table="siteSetting" id="sec_faq_accent" field="value" value={st(bag,"sec_faq_accent","soru burada")} label="SSS Başlık Aksan" revalidatePaths={R} as="span" className="text-gradient-gold">
              <span className="text-gradient-gold">{st(bag,"sec_faq_accent","soru burada")}</span>
            </EditableWrapper>
          </h2>
        </div>
        <FaqAccordion items={FAQS.slice(0, 5)} defaultOpen={0} />
        <div className="mt-6 text-center">
          <Link href="/sss" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:border-brand-yellow/50 hover:text-brand-yellow">
            <EditableWrapper table="siteSetting" id="sec_faq_cta" field="value" value={st(bag,"sec_faq_cta","Tüm sorular")} label="SSS CTA" revalidatePaths={R} as="span">
              {st(bag,"sec_faq_cta","Tüm sorular")}
            </EditableWrapper>
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </Link>
        </div>
      </AnimatedSection>

      {/* ── CTA Strip ── */}
      <AnimatedSection as="section" className="mx-auto max-w-7xl px-6 pb-24 pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-yellow/15 via-white/[0.02] to-brand-yellow/5 p-10 backdrop-blur-md md:p-14">
          <div aria-hidden className="absolute inset-0 -z-10 opacity-40"
            style={{ backgroundImage: "radial-gradient(60% 80% at 80% 50%, rgba(255,215,0,0.18) 0%, transparent 70%)" }} />
          <div aria-hidden className="absolute inset-0 -z-10 opacity-30"
            style={{
              backgroundImage: "linear-gradient(rgba(255,215,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.08) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse 60% 80% at 50% 50%, black 30%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 80% at 50% 50%, black 30%, transparent 80%)",
            }}
          />
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <EditableWrapper table="siteSetting" id="sec_cta_badge" field="value" value={st(bag,"sec_cta_badge","Servis randevusu")} label="CTA Badge" revalidatePaths={R}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/70 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
                  {st(bag,"sec_cta_badge","Servis randevusu")}
                </span>
              </EditableWrapper>
              <h3 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                <EditableWrapper table="siteSetting" id="sec_cta_title" field="value" value={st(bag,"sec_cta_title","Motorun bakım")} label="CTA Başlık" revalidatePaths={R} as="span">
                  {st(bag,"sec_cta_title","Motorun bakım")}
                </EditableWrapper>{" "}
                <EditableWrapper table="siteSetting" id="sec_cta_accent" field="value" value={st(bag,"sec_cta_accent","vakti gelmiş olabilir.")} label="CTA Başlık Aksan" revalidatePaths={R} as="span" className="text-gradient-gold">
                  <span className="text-gradient-gold">{st(bag,"sec_cta_accent","vakti gelmiş olabilir.")}</span>
                </EditableWrapper>
              </h3>
              <EditableWrapper table="siteSetting" id="sec_cta_desc" field="value" value={st(bag,"sec_cta_desc","Online randevu sistemiyle sıra beklemeden, dakikalar içinde gününü ayarla. Uzman ekibimiz seni karşılasın.")} label="CTA Açıklama" fieldType="textarea" revalidatePaths={R}>
                <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-base">
                  {st(bag,"sec_cta_desc","Online randevu sistemiyle sıra beklemeden, dakikalar içinde gününü ayarla. Uzman ekibimiz seni karşılasın.")}
                </p>
              </EditableWrapper>
            </div>
            <Link href="/randevu" className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-yellow px-7 py-4 text-sm font-semibold text-brand-black shadow-[0_18px_40px_-12px_rgba(255,215,0,0.7)] transition hover:shadow-[0_24px_50px_-10px_rgba(255,215,0,0.9)]">
              <EditableWrapper table="siteSetting" id="sec_cta_button" field="value" value={st(bag,"sec_cta_button","Hemen Randevu Al")} label="CTA Buton" revalidatePaths={R} as="span">
                {st(bag,"sec_cta_button","Hemen Randevu Al")}
              </EditableWrapper>
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
