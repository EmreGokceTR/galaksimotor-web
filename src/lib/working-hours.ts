import { getSettings } from "@/lib/site-settings";
import { SITE } from "@/config/site";

export type WorkingHours = {
  /** Randevu başlangıç saati (24s). */
  start: number;
  /** Randevu bitiş saati (24s, bu saat dahil değil). */
  end: number;
  /** Randevu slot aralığı (dakika). */
  slotMinutes: number;
  /** Açık günler — JS getDay() değerleri (0=Pazar ... 6=Cumartesi). */
  openDays: number[];
  /** Gösterim metinleri. */
  weekdaysText: string;
  saturdayText: string;
  sundayText: string;
};

export const WORKING_HOURS_KEYS = [
  "hours_start",
  "hours_end",
  "hours_slot_minutes",
  "hours_open_saturday",
  "hours_open_sunday",
  "hours_weekdays_text",
  "hours_saturday_text",
  "hours_sunday_text",
] as const;

/** Çalışma saatlerini siteSetting'den çek (yoksa SITE.hours fallback). */
export async function getWorkingHours(): Promise<WorkingHours> {
  const bag = await getSettings([...WORKING_HOURS_KEYS]);

  const numOr = (key: string, fb: number) => {
    const n = Number(bag[key]);
    return isNaN(n) ? fb : n;
  };
  const boolOr = (key: string, fb: boolean) =>
    bag[key] === undefined ? fb : bag[key] === "true";

  const saturdayOpen = boolOr("hours_open_saturday", true);
  const sundayOpen = boolOr("hours_open_sunday", false);

  const openDays = [1, 2, 3, 4, 5];
  if (saturdayOpen) openDays.push(6);
  if (sundayOpen) openDays.push(0);

  return {
    start: numOr("hours_start", SITE.hours.appointmentStart),
    end: numOr("hours_end", SITE.hours.appointmentEnd),
    slotMinutes: numOr("hours_slot_minutes", SITE.hours.appointmentSlotMinutes),
    openDays,
    weekdaysText: bag["hours_weekdays_text"] ?? SITE.hours.weekdays,
    saturdayText: bag["hours_saturday_text"] ?? SITE.hours.saturday,
    sundayText: bag["hours_sunday_text"] ?? SITE.hours.sunday,
  };
}
