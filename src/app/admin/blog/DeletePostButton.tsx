"use client";

import { useTransition } from "react";
import { deletePost } from "./actions";

export function DeletePostButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Bu yazı silinsin mi?")) return;
        start(() => deletePost(id));
      }}
      className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20 disabled:opacity-50"
    >
      Sil
    </button>
  );
}
