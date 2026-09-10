"use client";

import { motion } from "framer-motion";
import { Building2, ArrowUpRight, Settings } from "lucide-react";

interface StartupCardProps {
  startup: {
    id: string;
    name: string;
    stage: string;
    industry: string | null;
    _count: { goals: number };
  };
  isActive: boolean;
}

export function StartupCard({ startup, isActive }: StartupCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border p-6 transition-all ${
        isActive ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-muted">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        {isActive && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold mb-1">{startup.name}</h3>
      <p className="text-xs text-muted-foreground mb-4 capitalize">
        {startup.stage} Stage · {startup.industry || "Unknown Industry"}
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-background/50 border">
          <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Goals</p>
          <p className="text-lg font-bold">{startup._count.goals}</p>
        </div>
        <div className="p-3 rounded-xl bg-background/50 border">
          <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Tasks</p>
          <p className="text-lg font-bold">—</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          <Settings className="h-3 w-3" /> Manage
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
