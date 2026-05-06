"use client";

import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/context/EditModeContext";

export function EditModeToggle() {
  const { data: session } = useSession();
  const { isEditMode, toggleEditMode } = useEditMode();

  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  return (
    <AnimatePresence>
      {isAdmin && (
        <motion.div
          className="fixed bottom-24 right-5 z-[998] sm:bottom-24 sm:right-6"
          initial={{ opacity: 0, scale: 0.75, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.75, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.6 }}
        >
          <motion.button
            onClick={toggleEditMode}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-xl ring-1 transition-colors duration-200 ${
              isEditMode
                ? "bg-brand-yellow/15 text-brand-yellow ring-brand-yellow/40 shadow-[0_0_28px_rgba(255,215,0,0.15)]"
                : "bg-black/75 text-white/50 ring-white/10 hover:bg-black/85 hover:text-white/80 hover:ring-white/20"
            }`}
          >
            {isEditMode ? (
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" />
                <path d="M10 4l2 2" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                <circle cx="8" cy="8" r="2" />
              </svg>
            )}

            <span>{isEditMode ? "Düzenleme Modu" : "Görüntüleme"}</span>

            {isEditMode && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-yellow opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-yellow" />
              </span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
