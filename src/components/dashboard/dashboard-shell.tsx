"use client";

import { useRef, useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Sparkles,
  Settings,
  BookOpen,
  TrendingUp,
  Sun,
  Moon,
  Users,
  UserRound,
  Menu,
  LayoutGrid,
  CreditCard,
} from "lucide-react";
import { NotificationBell } from "@/components/dashboard/notifications/notification-bell";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { StartupSwitcher } from "@/components/dashboard/startup-switcher";
import { AmbientBackground } from "@/components/dashboard/ambient-background";
import { useTheme } from "@/components/theme-provider";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useDashboardStore } from "@/stores/dashboard-store";

interface Startup {
  id: string;
  name: string;
  stage: string;
  isPrimary: boolean;
}

interface DashboardShellProps {
  startups: Startup[];
  activeStartupId: string | null;
  children: React.ReactNode;
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const Icon = mounted ? (dark ? Sun : Moon) : Moon;
  return (
    <button
      onClick={toggle}
      title={mounted ? (dark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

const navItems = [
  { href: "/today", label: "Today", icon: Calendar },
  { href: "/review", label: "Weekly Review", icon: Sparkles },
  { href: "/journal", label: "Notes", icon: BookOpen },
  { href: "/history", label: "History", icon: TrendingUp },
  { href: "/crm", label: "CRM", icon: UserRound },
  { href: "/portfolio", label: "Portfolio", icon: LayoutGrid },
  { href: "/community/chat", label: "Community", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({
  startups,
  activeStartupId,
  onNavigate,
}: {
  startups: Startup[];
  activeStartupId: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <Link href="/today" onClick={onNavigate} className="mb-6 flex items-center gap-2.5 px-2">
        <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
        <h1 className="text-lg font-bold tracking-tight">FounderFlow</h1>
      </Link>

      <StartupSwitcher startups={startups} activeStartupId={activeStartupId ?? ""} />

      <nav className="space-y-0.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary -ml-px pl-[11px]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4 px-2 space-y-3">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
        </div>
        <div>
          <UserButton showName />
        </div>
      </div>
    </>
  );
}

export function DashboardShell({ startups, activeStartupId, children }: DashboardShellProps) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);
  const setSidebarOpen = useDashboardStore((s) => s.setSidebarOpen);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen">
        <AmbientBackground containerRef={mainRef} />

        <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-border bg-sidebar p-4">
          <SidebarContent startups={startups} activeStartupId={activeStartupId} />
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            overlayClassName="md:hidden"
            className="bg-sidebar p-4 md:hidden w-[260px]"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SidebarContent startups={startups} activeStartupId={activeStartupId} onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <main ref={mainRef} className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-4 md:p-8">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <button
                onClick={toggleSidebar}
                aria-label="Open menu"
                className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
              <span className="font-bold tracking-tight">FounderFlow</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}