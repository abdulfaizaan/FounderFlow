"use client";

import { useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Sparkles,
  Settings,
  Zap,
  BookOpen,
  TrendingUp,
  ListTodo,
  Sun,
  Moon,
  Users,
  UserRound,
  Menu,
} from "lucide-react";
import { NotificationBell } from "@/components/dashboard/notifications/notification-bell";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
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
  const Icon = dark ? Sun : Moon;
  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

const navItems = [
  { href: "/today", label: "Today", icon: Calendar },
  { href: "/plan", label: "Plan", icon: ListTodo },
  { href: "/review", label: "Weekly Review", icon: Sparkles },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/history", label: "History", icon: TrendingUp },
  { href: "/wiki", label: "Wiki", icon: BookOpen },
  { href: "/crm", label: "CRM", icon: UserRound },
  { href: "/community/chat", label: "Community", icon: Users },
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
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6349ea] via-[#875fe0] to-[#0099ff] flex items-center justify-center shadow-lg shadow-primary/25">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-lg font-bold tracking-tight">FounderFlow</h1>
      </Link>

      <StartupSwitcher startups={startups} activeStartupId={activeStartupId ?? ""} />

      <nav className="space-y-1 flex-1">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border pt-4 px-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
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

        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl p-4">
          <SidebarContent startups={startups} activeStartupId={activeStartupId} />
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            overlayClassName="md:hidden"
            className="bg-sidebar/95 p-4 md:hidden"
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
                className="rounded-lg border p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              >
                <Menu className="h-4 w-4" />
              </button>
              <span className="font-bold tracking-tight">FounderFlow</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
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