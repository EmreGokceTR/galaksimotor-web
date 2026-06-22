"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";
import { AppointmentStatusSelect } from "./AppointmentStatusSelect";
import { adminCreateAppointment, rescheduleAppointment } from "./actions";

export type AppointmentRow = {
  id: string;
  scheduledAt: string; // ISO string
  status: string;
  service: { name: string; duration: number };
  user: { name: string | null; email: string; phone: string | null };
  note: string | null;
  motoBrand: string | null;
  motoModel: string | null;
  motoYear: number | null;
};

type ServiceOption = { id: string; name: string; duration: number };
type UserOption = { id: string; label: string };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  CONFIRMED: "border-blue-400/30 bg-blue-500/10 text-blue-300",
  COMPLETED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  CANCELLED: "border-rose-400/30 bg-rose-500/10 text-rose-300",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

const DAY_LABELS = ["Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt", "Paz"];

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()} – ${sunday.toLocaleDateString("tr-TR", opts)} ${monday.getFullYear()}`;
  }
  return `${monday.toLocaleDateString("tr-TR", opts)} – ${sunday.toLocaleDateString("tr-TR", opts)} ${sunday.getFullYear()}`;
}

/** ISO → datetime-local input değeri (yerel saat). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type TimeFilter = "future" | "past" | "all";

export function AppointmentsClient({
  appointments,
  services = [],
  users = [],
}: {
  appointments: AppointmentRow[];
  services?: ServiceOption[];
  users?: UserOption[];
}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const [showNew, setShowNew] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("future");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // Liste görünümü filtresi
  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        const t = new Date(a.scheduledAt).getTime();
        if (timeFilter === "future" && t < startOfToday) return false;
        if (timeFilter === "past" && t >= startOfToday) return false;
        if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) =>
        timeFilter === "past"
          ? b.scheduledAt.localeCompare(a.scheduledAt)
          : a.scheduledAt.localeCompare(b.scheduledAt)
      );
  }, [appointments, timeFilter, statusFilter, startOfToday]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + 7);
    return d;
  }, [weekStart]);

  const apptsByDay = useMemo(() => {
    const map: Record<string, AppointmentRow[]> = {};
    for (const day of weekDays) map[day.toISOString().slice(0, 10)] = [];
    for (const a of appointments) {
      const key = new Date(a.scheduledAt).toISOString().slice(0, 10);
      if (key in map) {
        map[key].push(a);
        map[key].sort((x, y) => x.scheduledAt.localeCompare(y.scheduledAt));
      }
    }
    return map;
  }, [appointments, weekDays]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  return (
    <div>
      {/* ── Üst kontroller ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
            <button
              onClick={() => setView("list")}
              className={`rounded-lg px-4 py-1.5 text-sm transition ${
                view === "list"
                  ? "bg-brand-yellow font-semibold text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              📋 Liste
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`rounded-lg px-4 py-1.5 text-sm transition ${
                view === "calendar"
                  ? "bg-brand-yellow font-semibold text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              📅 Takvim
            </button>
          </div>

          {view === "calendar" && (
            <div className="flex items-center gap-2">
              <button onClick={prevWeek} className="rounded-lg border border-white/10 px-3 py-1.5 text-white/70 transition hover:border-white/20 hover:text-white">‹</button>
              <span className="min-w-[220px] text-center text-sm text-white/80">{formatWeekRange(weekStart)}</span>
              <button onClick={nextWeek} className="rounded-lg border border-white/10 px-3 py-1.5 text-white/70 transition hover:border-white/20 hover:text-white">›</button>
              <button onClick={() => setWeekStart(getMondayOf(new Date()))} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:text-white">Bugün</button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowNew((s) => !s)}
          className="rounded-xl bg-brand-yellow px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-yellow/80"
        >
          {showNew ? "× Kapat" : "+ Yeni Randevu"}
        </button>
      </div>

      {/* ── Yeni randevu formu ── */}
      {showNew && (
        <NewAppointmentForm
          services={services}
          users={users}
          onDone={() => setShowNew(false)}
        />
      )}

      {/* ── Liste görünümü filtreleri ── */}
      {view === "list" && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5 text-xs">
            {(["future", "past", "all"] as TimeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`rounded-md px-3 py-1 transition ${
                  timeFilter === tf
                    ? "bg-brand-yellow font-semibold text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tf === "future" ? "Gelecek" : tf === "past" ? "Geçmiş" : "Tümü"}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white outline-none focus:border-brand-yellow/40"
          >
            <option value="ALL">Tüm durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="CONFIRMED">Onaylı</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="CANCELLED">İptal</option>
          </select>
          <span className="text-xs text-white/40">{filtered.length} kayıt</span>
        </div>
      )}

      {/* ────────── Liste Görünümü ────────── */}
      {view === "list" ? (
        filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
            Bu filtreye uygun randevu yok.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-left text-[11px] uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-4 py-3">Tarih / Saat</th>
                    <th className="px-4 py-3">Servis</th>
                    <th className="px-4 py-3">Müşteri</th>
                    <th className="px-4 py-3">Motor</th>
                    <th className="px-4 py-3">Not</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((a) => {
                    const dt = new Date(a.scheduledAt);
                    return (
                      <tr key={a.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-white">{dt.toLocaleDateString("tr-TR")}</div>
                          <div className="text-[11px] text-brand-yellow">
                            {dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-white">
                          {a.service.name}
                          <div className="text-[11px] text-white/45">{a.service.duration} dk</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-white">{a.user.name ?? a.user.email}</div>
                          <div className="text-[11px] text-white/45">
                            {a.user.phone ? (
                              <a href={`tel:${a.user.phone.replace(/\s/g, "")}`} className="hover:text-brand-yellow">
                                {a.user.phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-white/75">
                          {a.motoBrand || a.motoModel ? `${a.motoBrand ?? ""} ${a.motoModel ?? ""}`.trim() : "—"}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="line-clamp-2 max-w-[240px] text-xs text-white/60">{a.note ?? "—"}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <AppointmentStatusSelect id={a.id} status={a.status as AppointmentStatus} />
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <RescheduleControl id={a.id} currentIso={a.scheduledAt} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* ────────── Takvim Görünümü ────────── */
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-md">
          <div className="grid grid-cols-7 border-b border-white/10">
            {weekDays.map((day, i) => {
              const isToday = day.getTime() === today.getTime();
              return (
                <div key={i} className={`border-r border-white/5 px-2 py-3 text-center last:border-0 ${isToday ? "bg-brand-yellow/10" : ""}`}>
                  <div className={`text-[10px] uppercase tracking-wider ${isToday ? "text-brand-yellow" : "text-white/40"}`}>{DAY_LABELS[i]}</div>
                  <div className={`mt-0.5 text-xl font-bold leading-none ${isToday ? "text-brand-yellow" : "text-white"}`}>{day.getDate()}</div>
                  <div className="mt-0.5 text-[10px] text-white/30">{day.toLocaleDateString("tr-TR", { month: "short" })}</div>
                </div>
              );
            })}
          </div>
          <div className="grid min-h-[280px] grid-cols-7">
            {weekDays.map((day, i) => {
              const key = day.toISOString().slice(0, 10);
              const dayAppts = apptsByDay[key] ?? [];
              const isToday = day.getTime() === today.getTime();
              return (
                <div key={i} className={`space-y-1.5 border-r border-white/5 p-2 last:border-0 ${isToday ? "bg-brand-yellow/[0.03]" : ""}`}>
                  {dayAppts.length === 0 ? (
                    <div className="py-2 text-center text-[10px] text-white/15">—</div>
                  ) : (
                    dayAppts.map((a) => {
                      const dt = new Date(a.scheduledAt);
                      return (
                        <div key={a.id} className={`rounded-lg border p-2 text-[11px] leading-snug ${STATUS_COLORS[a.status] ?? "border-white/10 bg-white/5 text-white/60"}`} title={`${a.user.name ?? a.user.email} — ${a.note ?? ""}`}>
                          <div className="font-bold">{dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
                          <div className="truncate font-medium">{a.service.name}</div>
                          <div className="truncate opacity-75">{a.user.name ?? a.user.email}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t border-white/5 px-4 py-2 text-[11px] text-white/30">
            {weekStart.toLocaleDateString("tr-TR")} – {new Date(weekEnd.getTime() - 1).toLocaleDateString("tr-TR")} haftasında {Object.values(apptsByDay).flat().length} randevu
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Yeni randevu formu ──────────────────────────────────────────────────────

function NewAppointmentForm({
  services,
  users,
  onDone,
}: {
  services: ServiceOption[];
  users: UserOption[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"guest" | "existing">("guest");

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [existingUserId, setExistingUserId] = useState(users[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [motoBrand, setMotoBrand] = useState("");
  const [motoModel, setMotoModel] = useState("");
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!serviceId) return setError("Hizmet seçin.");
    if (!scheduledAt) return setError("Tarih ve saat seçin.");
    if (mode === "guest" && !guestName.trim()) return setError("Misafir adı girin.");
    if (mode === "existing" && !existingUserId) return setError("Kayıtlı müşteri seçin.");

    startTransition(async () => {
      const res = await adminCreateAppointment({
        serviceId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        existingUserId: mode === "existing" ? existingUserId : null,
        guestName: mode === "guest" ? guestName : undefined,
        guestPhone: mode === "guest" ? guestPhone : undefined,
        motoBrand: motoBrand || undefined,
        motoModel: motoModel || undefined,
        note: note || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-yellow/40 placeholder:text-white/25";

  return (
    <form onSubmit={submit} className="mb-5 space-y-4 rounded-2xl border border-brand-yellow/20 bg-brand-yellow/[0.03] p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-yellow">Yeni Randevu (manuel)</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Hizmet *</span>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputCls}>
            {services.length === 0 && <option value="">Önce hizmet ekleyin</option>}
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.duration} dk)</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/50">Tarih & Saat *</span>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputCls} />
        </label>
      </div>

      {/* Müşteri modu */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("guest")} className={`rounded-lg px-3 py-1.5 text-xs transition ${mode === "guest" ? "bg-brand-yellow font-semibold text-black" : "border border-white/10 text-white/60"}`}>Misafir (ad + telefon)</button>
        <button type="button" onClick={() => setMode("existing")} className={`rounded-lg px-3 py-1.5 text-xs transition ${mode === "existing" ? "bg-brand-yellow font-semibold text-black" : "border border-white/10 text-white/60"}`}>Kayıtlı müşteri</button>
      </div>

      {mode === "guest" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ad Soyad *" className={inputCls} />
          <input type="text" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Telefon" className={inputCls} />
        </div>
      ) : (
        <select value={existingUserId} onChange={(e) => setExistingUserId(e.target.value)} className={inputCls}>
          {users.length === 0 && <option value="">Kayıtlı müşteri yok</option>}
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.label}</option>
          ))}
        </select>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <input type="text" value={motoBrand} onChange={(e) => setMotoBrand(e.target.value)} placeholder="Motor markası (ops.)" className={inputCls} />
        <input type="text" value={motoModel} onChange={(e) => setMotoModel(e.target.value)} placeholder="Motor modeli (ops.)" className={inputCls} />
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Not (opsiyonel)" className={inputCls} />

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-xl border border-white/15 px-5 py-2 text-sm text-white/70 hover:text-white">Vazgeç</button>
        <button type="submit" disabled={isPending} className="rounded-xl bg-brand-yellow px-6 py-2 text-sm font-semibold text-black hover:bg-brand-yellow/80 disabled:opacity-50">
          {isPending ? "Ekleniyor…" : "Randevu Ekle"}
        </button>
      </div>
    </form>
  );
}

// ─── Yeniden planlama kontrolü ───────────────────────────────────────────────

function RescheduleControl({ id, currentIso }: { id: string; currentIso: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => toLocalInput(currentIso));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    if (!value) return;
    startTransition(async () => {
      const res = await rescheduleAppointment(id, new Date(value).toISOString());
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/70 hover:text-brand-yellow"
      >
        Tarihi değiştir
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white outline-none focus:border-brand-yellow/40"
      />
      <div className="flex gap-1.5">
        <button type="button" disabled={isPending} onClick={save} className="rounded-full bg-brand-yellow px-3 py-1 text-[11px] font-semibold text-black hover:bg-brand-yellow/80 disabled:opacity-50">
          {isPending ? "…" : "Kaydet"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/60 hover:text-white">İptal</button>
      </div>
      {error && <span className="max-w-[180px] text-right text-[10px] text-rose-300">{error}</span>}
    </div>
  );
}
