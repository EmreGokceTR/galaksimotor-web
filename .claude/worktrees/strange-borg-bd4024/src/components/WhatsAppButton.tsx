"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditableWrapper } from "./EditableWrapper";

export type WaSettings = {
  phone: string;
  prefillMsg: string;
  tooltipTitle: string;
  tooltipSub: string;
};

export function WhatsAppButton({ settings: s }: { settings: WaSettings }) {
  const [show, setShow] = useState(false);
  const [tooltip, setTooltip] = useState(true);

  const waLink = `https://wa.me/${s.phone}?text=${encodeURIComponent(s.prefillMsg)}`;

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 800);
    const t2 = setTimeout(() => setTooltip(false), 6000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="fixed bottom-5 right-5 z-[55] flex items-end gap-3 sm:bottom-6 sm:right-6"
        >
          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-1 hidden max-w-[220px] rounded-2xl border border-white/10 bg-brand-black/85 px-4 py-3 text-sm text-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:block"
              >
                <button
                  onClick={() => setTooltip(false)}
                  aria-label="Kapat"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-brand-black text-[10px] text-white/60 hover:text-white"
                >
                  ×
                </button>
                <EditableWrapper
                  table="siteSetting"
                  id="wa_tooltip_title"
                  field="value"
                  value={s.tooltipTitle}
                  label="WhatsApp Tooltip Başlık"
                  revalidatePaths={["/"]}
                >
                  <p className="font-semibold leading-tight">{s.tooltipTitle}</p>
                </EditableWrapper>
                <EditableWrapper
                  table="siteSetting"
                  id="wa_tooltip_sub"
                  field="value"
                  value={s.tooltipSub}
                  label="WhatsApp Tooltip Alt Yazı"
                  revalidatePaths={["/"]}
                >
                  <p className="mt-0.5 text-xs text-white/65">{s.tooltipSub}</p>
                </EditableWrapper>
                <span className="absolute -right-1.5 bottom-5 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-brand-black/85" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button — EditableWrapper ile telefon numarası DB'den güncellenebilir */}
          <EditableWrapper
            table="siteSetting"
            id="wa_phone"
            field="value"
            value={s.phone}
            label="WhatsApp Numarası (ülke kodu dahil, sadece rakam: 905xxxxxxxxx)"
            revalidatePaths={["/"]}
            as="span"
          >
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp ile iletişim"
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-8px_rgba(37,211,102,0.6),0_0_0_4px_rgba(37,211,102,0.15)] transition-transform hover:scale-110"
            >
              {/* Pulse rings */}
              <span className="pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
              <span className="pointer-events-none absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-0 transition-opacity group-hover:opacity-20" />

              <svg
                viewBox="0 0 32 32"
                className="relative h-7 w-7"
                fill="currentColor"
              >
                <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.4 2 7.7L.3 31.6l8.2-2.1A15.6 15.6 0 0 0 16 31.6c8.6 0 15.6-7 15.6-15.6S24.6.4 16 .4Zm0 28.4a12.8 12.8 0 0 1-6.5-1.8l-.5-.3-4.9 1.3 1.3-4.7-.3-.5A12.8 12.8 0 1 1 28.8 16c0 7-5.7 12.8-12.8 12.8Zm7-9.6c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.2.4-1 1.3-1.2 1.5-.2.2-.4.2-.8 0-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.5-.2-.4 0-.6.2-.8.2-.2.4-.4.5-.7.2-.2.2-.4.4-.7.1-.2.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.7-.6-.6-.9-.6h-.7c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.9 5.2 3.5 1.4 3.5 1 4.2.9.6-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.4-.3-.8-.5Z" />
              </svg>
            </a>
          </EditableWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
