"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { RefObject } from "react";

export function AmbientBackground({
  containerRef,
}: {
  containerRef?: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({ container: containerRef ?? undefined });
  const indigoY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const tealY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const amberY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.25], [1, 0.55]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: indigoY, opacity: fade }}
        className="absolute -top-48 -left-48 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,oklch(0.78_0.13_287/0.3),transparent_65%)] blur-2xl"
      />
      <motion.div
        style={{ y: tealY }}
        className="absolute -bottom-56 -right-40 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,oklch(0.63_0.2_243/0.18),transparent_65%)] blur-2xl"
      />
      <motion.div
        style={{ y: amberY }}
        className="absolute top-1/3 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.23_285/0.06),transparent_65%)] blur-3xl"
      />
    </div>
  );
}