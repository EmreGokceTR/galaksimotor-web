"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const noMotion: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 } as never,
  },
};

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** When true, children are wrapped with stagger; immediate children should be `<AnimatedItem>` */
  stagger?: boolean;
  amount?: number;
  /** Render as motion.section by default; use "div" inside narrower wrappers */
  as?: "section" | "div" | "article";
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  stagger: useStagger = false,
  amount = 0.2,
  as = "section",
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const Component =
    as === "section" ? motion.section : as === "article" ? motion.article : motion.div;

  // Kullanıcı reduced-motion seçtiyse veya zaten görünür olacaksa animasyonu atla
  const variants = useStagger ? stagger : prefersReducedMotion ? noMotion : fadeUp;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "0px 0px -10% 0px" }}
      variants={variants}
      transition={
        useStagger || prefersReducedMotion
          ? undefined
          : { duration: 0.5, ease: EASE_OUT, delay }
      }
      // content-visibility: auto — section görünür alana girene kadar
      // tarayıcı paint/layout YAPMAZ → ana sayfada toplam paint maliyeti
      // %60-80 düşer, scroll Chromium'da kayar gibi pürüzsüz olur.
      // contain-intrinsic-size off-screen iken yer tutmak için (CLS önler).
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "1px 500px",
      }}
    >
      {children}
    </Component>
  );
}

export function AnimatedItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={prefersReducedMotion ? noMotion : fadeUp}
      transition={
        prefersReducedMotion
          ? undefined
          : { duration: 0.5, ease: EASE_OUT, delay }
      }
    >
      {children}
    </motion.div>
  );
}
