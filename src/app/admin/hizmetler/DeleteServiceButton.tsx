"use client";

import { useState, useTransition } from "react";
import { deleteService } from "./actions";

export function DeleteServiceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-white/60">Emin misin?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => { await deleteService(id); })}
          className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-400 ring-1 ring-rose-400/30 hover:bg-rose-500/30 disabled:opacity-50"
        >
          {isPending ? "Siliniyor…" : "Evet, sil"}
        </button>
        <button type="button" onClick={() => setConfirm(false)}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:text-white">
          İptal
        </button>
      </span>
    );
  }

  return (
    <button type="button" onClick={() => setConfirm(true)}
      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-rose-400/80 hover:text-rose-400">
      Sil
    </button>
  );
}
