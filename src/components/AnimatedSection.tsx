"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
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
  const Component =
    as === "section" ? motion.section : as === "article" ? motion.article : motion.div;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={useStagger ? stagger : fadeUp}
      transition={
        useStagger ? undefined : { duration: 0.7, ease: EASE_OUT, delay }
      }
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
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
