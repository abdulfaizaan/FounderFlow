"use client";

import { motion, useScroll, useTransform } from "motion/react";
import type { RefObject } from "react";

export function AmbientBackground({
  containerRef,
}: {
  containerRef?: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({ container: containerRef ?? undefined });
  const primaryY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const secondaryY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const tertiaryY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.25], [1, 0.55]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: primaryY, opacity: fade }}
        className="absolute -top-48 -left-48 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.04),transparent_65%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(20,184,166,0.04),transparent_65%)]"
      />
      <motion.div
        style={{ y: secondaryY }}
        className="absolute -bottom-56 -right-40 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.02),transparent_65%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(20,184,166,0.025),transparent_65%)]"
      />
      <motion.div
        style={{ y: tertiaryY }}
        className="absolute top-1/3 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.015),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(20,184,166,0.015),transparent_65%)]"
      />
    </div>
  );
}