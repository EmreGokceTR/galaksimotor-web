"use client";

import { useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "./actions";

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Beklemede",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

const COLORS: Record<OrderStatus, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  PREPARING: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  SHIPPED: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  DELIVERED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  CANCELLED: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus;
    startTransition(async () => {
      await updateOrderStatus(orderId, next);
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={pending}
      className={`rounded-full border px-3 py-1 text-xs font-medium outline-none transition disabled:opacity-50 ${COLORS[status]}`}
    >
      {(Object.keys(LABELS) as OrderStatus[]).map((s) => (
        <option key={s} value={s} className="bg-brand-black text-white">
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
