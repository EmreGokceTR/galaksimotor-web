import { requireAdmin } from "@/lib/admin";
import { getWorkingHours } from "@/lib/working-hours";
import { WorkingHoursEditor } from "./WorkingHoursEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Çalışma Saatleri · Admin" };

export default async function WorkingHoursSettingsPage() {
  await requireAdmin();
  const wh = await getWorkingHours();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Çalışma Saatleri</h1>
        <p className="mt-1 text-sm text-white/50">
          Açılış/kapanış saatleri, randevu aralığı ve açık günler. Bu ayarlar
          hem randevu sayfasındaki seçilebilir saatleri hem de iletişim
          sayfasındaki gösterimi anında etkiler.
        </p>
      </header>
      <WorkingHoursEditor
        start={wh.start}
        end={wh.end}
        slotMinutes={wh.slotMinutes}
        saturdayOpen={wh.openDays.includes(6)}
        sundayOpen={wh.openDays.includes(0)}
        weekdaysText={wh.weekdaysText}
        saturdayText={wh.saturdayText}
        sundayText={wh.sundayText}
      />
    </div>
  );
}
