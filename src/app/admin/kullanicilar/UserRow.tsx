"use client";

import { useTransition, useState } from "react";
import { changeUserRole, deleteUser } from "./actions";

type Props = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "USER" | "ADMIN";
    phone: string | null;
    createdAt: string;
    orderCount: number;
    appointmentCount: number;
    favoriteCount: number;
  };
  isSelf: boolean;
};

export function UserRow({ user, isSelf }: Props) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const isDeleted = user.email.endsWith("@deleted.local");

  function handleRoleToggle() {
    if (isSelf) return;
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const word = newRole === "ADMIN" ? "ADMIN yap" : "USER yap";
    if (!confirm(`${user.email} için "${word}" işlemi onaylayın.`)) return;
    setErr(null);
    startTransition(async () => {
      try {
        await changeUserRole(user.id, newRole);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "İşlem başarısız.");
      }
    });
  }

  function handleDelete() {
    if (isSelf) return;
    if (
      !confirm(
        `${user.email} silinecek. Kişisel veriler temizlenir, sipariş geçmişi anonim olarak kalır. Devam edilsin mi?`
      )
    )
      return;
    setErr(null);
    startTransition(async () => {
      try {
        await deleteUser(user.id);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Silme başarısız.");
      }
    });
  }

  return (
    <tr className={`align-top transition ${pending ? "opacity-50" : ""} ${isDeleted ? "opacity-50" : ""}`}>
      <td className="px-4 py-3">
        <div className="font-medium text-white">
          {user.name || (isDeleted ? <span className="italic text-white/40">— silinmiş —</span> : <span className="text-white/40">(isimsiz)</span>)}
        </div>
        <div className="text-xs text-white/45">{user.email}</div>
        {user.phone && <div className="text-xs text-white/35">{user.phone}</div>}
        {isSelf && (
          <div className="mt-1 inline-flex items-center rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-medium text-brand-yellow">
            SEN
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            user.role === "ADMIN"
              ? "bg-brand-yellow/20 text-brand-yellow ring-1 ring-brand-yellow/40"
              : "bg-white/10 text-white/70"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-white/65">
        <div>📦 {user.orderCount} sipariş</div>
        <div>📅 {user.appointmentCount} randevu</div>
        <div>♡ {user.favoriteCount} favori</div>
      </td>
      <td className="px-4 py-3 text-xs text-white/50">
        {new Date(user.createdAt).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-end gap-1.5">
          {!isSelf && !isDeleted && (
            <>
              <button
                type="button"
                onClick={handleRoleToggle}
                disabled={pending}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70 hover:border-brand-yellow/40 hover:text-brand-yellow disabled:opacity-50"
              >
                {user.role === "ADMIN" ? "↓ USER yap" : "↑ ADMIN yap"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] text-rose-200 hover:border-rose-400 hover:text-rose-100 disabled:opacity-50"
              >
                🗑 Sil
              </button>
            </>
          )}
          {isSelf && (
            <span className="text-[11px] text-white/30">— kendin —</span>
          )}
          {err && (
            <span className="text-[10px] text-rose-300">{err}</span>
          )}
        </div>
      </td>
    </tr>
  );
}
