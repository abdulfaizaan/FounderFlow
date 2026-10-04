"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { motion, useReducedMotion } from "motion/react";

export default function SignUpPage() {
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-[#0e0e0e] p-12 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 h-[25rem] w-[25rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.06),transparent_65%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.04),transparent_65%)] blur-3xl pointer-events-none" />

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-contain" />
            <h1 className="text-lg font-bold tracking-tight text-[#ede8e3]">FounderFlow</h1>
          </Link>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#ede8e3] leading-snug max-w-md">
            Start shipping faster, today
          </h2>
          <p className="mt-4 text-[#8a8580] text-base leading-relaxed max-w-md">
            Get your first AI-powered recommendation in under 2 minutes. No credit card required.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { step: "1", text: "Tell us about your startup" },
              { step: "2", text: "Set your first goal" },
              { step: "3", text: "Get your daily plan" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
                  {item.step}
                </div>
                <span className="text-sm text-[#8a8580]">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 text-sm text-[#5e5a55]">
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" />
            <span>Join 500+ solo founders</span>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" />
          </div>
        </motion.div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-[#f8f7f4] dark:bg-[#0e0e0e]">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md clerk-auth-wrapper"
        >
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-contain" />
            <h1 className="text-lg font-bold tracking-tight">FounderFlow</h1>
          </div>

          <SignUp />
        </motion.div>
      </div>
    </div>
  );
}
