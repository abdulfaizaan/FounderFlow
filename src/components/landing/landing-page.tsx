"use client";

import Link from "next/link";
import { Sparkles, CalendarClock, BarChart3, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";

const features = [
  {
    icon: Sparkles,
    title: "A daily recommendation, not a dashboard dump",
    body: "Each morning FounderFlow surfaces the single highest-leverage task for your current goal — ranked by impact, not by recency.",
  },
  {
    icon: CalendarClock,
    title: "Scheduling built around your real capacity",
    body: "Drop recommendations into your day alongside deadlines and deep-work hours, so you never overcommit again.",
  },
  {
    icon: BarChart3,
    title: "Track evidence, not vibes",
    body: "Log customers, revenue, and shipping velocity. Your weekly review is generated from what actually happened.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="FounderFlow home">
            <img src="/logo.png" alt="FounderFlow" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="btn-press inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.06),transparent_65%)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 -left-24 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.05),transparent_65%)] blur-3xl" />

          <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:pb-28 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <Reveal>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles className="h-3 w-3" />
                    Your daily AI copilot
                  </span>
                </Reveal>
                <Reveal delay={0.08}>
                  <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    Turn startup uncertainty into{" "}
                    <span className="text-primary">daily progress</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                    FounderFlow plans your day around one goal — telling you what to
                    do, when, and why. Built for solo founders who ship.
                  </p>
                </Reveal>
                <Reveal delay={0.24}>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href="/sign-up"
                      className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Start free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
                    >
                      Sign in
                    </Link>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Free to start · No credit card required
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.2} className="relative">
                <DashboardMockup />
              </Reveal>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Three loops that keep a solo founder moving — every single day.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-border bg-card p-6 transition-colors duration-150 hover:border-primary/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Social proof band */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span className="text-center text-xs sm:text-sm">
                Join 500+ solo founders shipping with FounderFlow
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </Reveal>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-14 text-center sm:px-12 lg:px-16">
              <div className="pointer-events-none absolute left-1/2 top-0 h-[20rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.08),transparent_65%)] blur-3xl" />
              <div className="relative">
                <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                  Start shipping today
                </h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  Get your first AI-powered recommendation in under 2 minutes. No
                  credit card required.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/sign-up"
                    className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FounderFlow" width={28} height={28} loading="lazy" className="h-7 w-7 rounded-lg object-contain" />
          </div>
          <p className="text-xs text-muted-foreground">
            Turn startup uncertainty into daily progress.
          </p>
          <p className="text-xs text-muted-foreground">© 2026 FounderFlow</p>
        </div>
      </footer>
    </div>
  );
}