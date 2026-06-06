"use client";

import { useTransition, useState } from "react";
import { refundOrder } from "./actions";

export function RefundButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function handleClick() {
    if (!confirm("Bu siparişi iade etmek istediğinize emin misiniz?\nİyzico üzerinden ödeme iade edilecek ve sipariş iptal edilecek.")) return;
    setResult(null);
    startTransition(async () => {
      const res = await refundOrder(orderId);
      setResult(res);
    });
  }

  if (result?.ok) {
    return (
      <span className="text-[11px] font-medium text-emerald-300">✓ İade edildi</span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
      >
        {pending ? "İşleniyor…" : "İade Et"}
      </button>
      {result && !result.ok && (
        <span className="max-w-[140px] text-[10px] leading-tight text-rose-400">
          {result.error}
        </span>
      )}
    </div>
  );
}
