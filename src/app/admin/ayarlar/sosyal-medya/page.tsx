import { requireAdmin } from "@/lib/admin";
import { getSocialValues } from "@/lib/social";
import { SocialEditor } from "./SocialEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sosyal Medya · Admin" };

export default async function SocialSettingsPage() {
  await requireAdmin();
  const values = await getSocialValues();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Sosyal Medya</h1>
        <p className="mt-1 text-sm text-white/50">
          Sosyal medya hesaplarınızın bağlantıları. Doldurduklarınız footer&apos;da
          ikon olarak görünür.
        </p>
      </header>
      <SocialEditor values={values} />
    </div>
  );
}
