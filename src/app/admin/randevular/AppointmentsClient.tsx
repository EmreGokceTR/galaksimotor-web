"use client";

import { useState, useMemo } from "react";
import { AppointmentStatus } from "@prisma/client";
import { AppointmentStatusSelect } from "./AppointmentStatusSelect";

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

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  CONFIRMED: "border-blue-400/30 bg-blue-500/10 text-blue-300",
  COMPLETED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  CANCELLED: "border-rose-400/30 bg-rose-500/10 text-rose-300",
};

const DAY_LABELS = ["Pzt", "Sal", "Çrş", "Per", "Cum", "Cmt", "Paz"];

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Paz
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

export function AppointmentsClient({
  appointments,
}: {
  appointments: AppointmentRow[];
}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));

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
    for (const day of weekDays) {
      map[day.toISOString().slice(0, 10)] = [];
    }
    for (const a of appointments) {
      const key = new Date(a.scheduledAt).toISOString().slice(0, 10);
      if (key in map) {
        map[key].push(a);
        map[key].sort((x, y) =>
          x.scheduledAt.localeCompare(y.scheduledAt)
        );
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
      {/* ── Görünüm / Hafta kontrolü ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Toggle: Liste | Takvim */}
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

        {/* Hafta navigasyonu (sadece takvim görünümünde) */}
        {view === "calendar" && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-white/70 transition hover:border-white/20 hover:text-white"
            >
              ‹
            </button>
            <span className="min-w-[220px] text-center text-sm text-white/80">
              {formatWeekRange(weekStart)}
            </span>
            <button
              onClick={nextWeek}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-white/70 transition hover:border-white/20 hover:text-white"
            >
              ›
            </button>
            <button
              onClick={() => setWeekStart(getMondayOf(new Date()))}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:text-white"
            >
              Bugün
            </button>
          </div>
        )}
      </div>

      {/* ────────── Liste Görünümü ────────── */}
      {view === "list" ? (
        appointments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
            Henüz randevu yok.
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {appointments.map((a) => {
                    const dt = new Date(a.scheduledAt);
                    return (
                      <tr key={a.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-white">
                            {dt.toLocaleDateString("tr-TR")}
                          </div>
                          <div className="text-[11px] text-brand-yellow">
                            {dt.toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-white">
                          {a.service.name}
                          <div className="text-[11px] text-white/45">
                            {a.service.duration} dk
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-white">
                            {a.user.name ?? a.user.email}
                          </div>
                          <div className="text-[11px] text-white/45">
                            {a.user.phone ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-white/75">
                          {a.motoBrand || a.motoModel
                            ? `${a.motoBrand ?? ""} ${a.motoModel ?? ""}`.trim()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="line-clamp-2 max-w-[260px] text-xs text-white/60">
                            {a.note ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <AppointmentStatusSelect
                            id={a.id}
                            status={a.status as AppointmentStatus}
                          />
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
          {/* Gün başlıkları */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {weekDays.map((day, i) => {
              const isToday = day.getTime() === today.getTime();
              return (
                <div
                  key={i}
                  className={`border-r border-white/5 px-2 py-3 text-center last:border-0 ${
                    isToday ? "bg-brand-yellow/10" : ""
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-wider ${
                      isToday ? "text-brand-yellow" : "text-white/40"
                    }`}
                  >
                    {DAY_LABELS[i]}
                  </div>
                  <div
                    className={`mt-0.5 text-xl font-bold leading-none ${
                      isToday ? "text-brand-yellow" : "text-white"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/30">
                    {day.toLocaleDateString("tr-TR", { month: "short" })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Randevu kartları */}
          <div className="grid min-h-[280px] grid-cols-7">
            {weekDays.map((day, i) => {
              const key = day.toISOString().slice(0, 10);
              const dayAppts = apptsByDay[key] ?? [];
              const isToday = day.getTime() === today.getTime();

              return (
                <div
                  key={i}
                  className={`space-y-1.5 border-r border-white/5 p-2 last:border-0 ${
                    isToday ? "bg-brand-yellow/[0.03]" : ""
                  }`}
                >
                  {dayAppts.length === 0 ? (
                    <div className="py-2 text-center text-[10px] text-white/15">
                      —
                    </div>
                  ) : (
                    dayAppts.map((a) => {
                      const dt = new Date(a.scheduledAt);
                      return (
                        <div
                          key={a.id}
                          className={`rounded-lg border p-2 text-[11px] leading-snug ${
                            STATUS_COLORS[a.status] ?? "border-white/10 bg-white/5 text-white/60"
                          }`}
                          title={`${a.user.name ?? a.user.email} — ${a.note ?? ""}`}
                        >
                          <div className="font-bold">
                            {dt.toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="truncate font-medium">
                            {a.service.name}
                          </div>
                          <div className="truncate opacity-75">
                            {a.user.name ?? a.user.email}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {/* Hafta özeti (bu haftaya ait randevu sayısı) */}
          <div className="border-t border-white/5 px-4 py-2 text-[11px] text-white/30">
            {weekStart.toLocaleDateString("tr-TR")} –{" "}
            {new Date(weekEnd.getTime() - 1).toLocaleDateString("tr-TR")} haftasında{" "}
            {Object.values(apptsByDay).flat().length} randevu
          </div>
        </div>
      )}
    </div>
  );
}
