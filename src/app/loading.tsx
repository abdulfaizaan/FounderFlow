"use client";

import { motion, useReducedMotion } from "motion/react";

export default function Loading() {
  const reduced = useReducedMotion();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: reduced ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <img src="/logo.png" alt="FounderFlow" width={48} height={48} className="relative h-12 w-12 rounded-xl object-contain" />
          <motion.div
            animate={reduced ? {} : { scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl bg-primary/20"
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-sm font-medium text-muted-foreground tracking-tight"
        >
          FounderFlow
        </motion.p>
      </motion.div>
    </div>
  );
}
