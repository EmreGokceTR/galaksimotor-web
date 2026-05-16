import { requireAdmin } from "@/lib/admin";
import { getSettings, st } from "@/lib/site-settings";
import { TestimonialsEditor } from "./TestimonialsEditor";

const DEFAULTS = [
  { name: "Mert K.", bike: "Honda PCX 160", rating: "5", text: "Periyodik bakım için randevuyu site üzerinden aldım, dakikasında işlem başladı. Usta CVT kayışını gösterip durumu açıkladı, şeffaflık çok hoşuma gitti." },
  { name: "Ayşe T.", bike: "Bajaj Pulsar F 250", rating: "5", text: "Koruma demirini ertesi gün elime aldım, montaj için de uğradım. 10/10 hizmet — fiyat-performans rakipsiz." },
  { name: "Burak D.", bike: "Kymco DTX 360", rating: "5", text: "Telefonla soru sordum, sorunumu uzaktan teşhis ettiler. Ertesi gün uğradım yarım saatte hallettiler. Bayilerden çok daha rahat çalışıyorlar." },
  { name: "Hakan E.", bike: "Yamaha MT-07", rating: "5", text: "Online sipariş ettim, aynı gün kargoya verdiler. Fatura, takip numarası her şey eksiksiz geldi. Müşteri ilişkisi profesyonel." },
  { name: "Selin Y.", bike: "Honda CB 125F", rating: "5", text: "Kask seçerken çok yardımcı oldular. Bedenimi denedim, yanlış olduğunu söylediler. Doğru beden için tekrar uğradım — bu samimiyet az bulunur." },
];

export default async function TestimonialsSettingsPage() {
  await requireAdmin();

  const bag = await getSettings([
    "testimonials_count",
    "t1_name","t1_bike","t1_rating","t1_text","t1_photo",
    "t2_name","t2_bike","t2_rating","t2_text","t2_photo",
    "t3_name","t3_bike","t3_rating","t3_text","t3_photo",
    "t4_name","t4_bike","t4_rating","t4_text","t4_photo",
    "t5_name","t5_bike","t5_rating","t5_text","t5_photo",
  ]);

  const count = st(bag, "testimonials_count", "5");

  const items = DEFAULTS.map((d, i) => {
    const n = i + 1;
    return {
      name:   st(bag, `t${n}_name`,   d.name),
      bike:   st(bag, `t${n}_bike`,   d.bike),
      rating: st(bag, `t${n}_rating`, d.rating),
      text:   st(bag, `t${n}_text`,   d.text),
      photo:  st(bag, `t${n}_photo`,  ""),
    };
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Müşteri Yorumları</h1>
        <p className="mt-1 text-sm text-white/50">
          Ana sayfadaki "Müşterilerimiz Ne Diyor?" bölümündeki yorumları buradan düzenleyebilirsiniz.
        </p>
      </header>
      <TestimonialsEditor items={items} count={count} />
    </div>
  );
}
