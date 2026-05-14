import { requireAdmin } from "@/lib/admin";
import { getSettings, st } from "@/lib/site-settings";
import { SITE } from "@/config/site";
import { IletisimEditor } from "./IletisimEditor";

export default async function IletisimSettingsPage() {
  await requireAdmin();
  const bag = await getSettings(["contact_address", "contact_phone", "contact_email"]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">İletişim Bilgileri</h1>
        <p className="mt-1 text-sm text-white/50">
          Footer ve iletişim sayfasındaki adres, telefon ve e-posta bilgileri.
        </p>
      </header>
      <IletisimEditor
        address={st(bag, "contact_address", `${SITE.address.line}, ${SITE.address.district} / ${SITE.address.city}`)}
        phone={st(bag, "contact_phone", SITE.phone)}
        email={st(bag, "contact_email", SITE.email)}
      />
    </div>
  );
}
