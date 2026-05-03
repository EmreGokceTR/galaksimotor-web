"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Item = { q: string; a: string };

export function FaqAccordion({
  items,
  defaultOpen = -1,
}: {
  items: Item[];
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <ul className="space-y-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li
            key={i}
            className={`overflow-hidden rounded-2xl border backdrop-blur-md transition ${
              isOpen
                ? "border-brand-yellow/40 bg-brand-yellow/[0.04]"
                : "border-white/10 bg-white/[0.025] hover:border-white/20"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span
                className={`text-sm font-semibold transition-colors md:text-base ${
                  isOpen ? "text-brand-yellow" : "text-white"
                }`}
              >
                {it.q}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                  isOpen
                    ? "rotate-45 border-brand-yellow bg-brand-yellow text-brand-black"
                    : "border-white/20 text-white/60"
                }`}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-white/70">
                    {it.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
