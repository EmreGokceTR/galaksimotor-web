"use client";

import { useState, useTransition } from "react";
import { setTrackingNumber } from "./actions";

export function TrackingInput({
  orderId,
  initial,
}: {
  orderId: string;
  initial: string | null;
}) {
  const [val, setVal] = useState(initial ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function commit() {
    if ((val.trim() || "") === (initial ?? "")) return;
    startTransition(async () => {
      await setTrackingNumber(orderId, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={val}
        placeholder="Kargo No"
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        disabled={pending}
        className="w-32 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/30 disabled:opacity-50"
      />
      {saved && (
        <span className="absolute -right-2 -top-2 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
        </span>
      )}
    </div>
  );
}
