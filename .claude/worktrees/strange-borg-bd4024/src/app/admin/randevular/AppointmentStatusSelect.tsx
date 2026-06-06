"use client";

import { useTransition } from "react";
import { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatus } from "./actions";

const LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

const COLORS: Record<AppointmentStatus, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  CONFIRMED: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  COMPLETED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  CANCELLED: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

export function AppointmentStatusSelect({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={status}
      onChange={(e) =>
        startTransition(() =>
          updateAppointmentStatus(id, e.target.value as AppointmentStatus)
        )
      }
      disabled={pending}
      className={`rounded-full border px-3 py-1 text-xs font-medium outline-none disabled:opacity-50 ${COLORS[status]}`}
    >
      {(Object.keys(LABELS) as AppointmentStatus[]).map((s) => (
        <option key={s} value={s} className="bg-brand-black text-white">
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
